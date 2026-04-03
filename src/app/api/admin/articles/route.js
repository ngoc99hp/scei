// src/app/api/admin/articles/route.js
import { NextResponse }    from "next/server"
import sql                 from "@/lib/db"
import { sanitizeHtml }    from "@/lib/sanitize"
import { requireApiAdmin } from "@/lib/auth"
import { articleSchema }   from "@/lib/validations"
import { logger }          from "@/lib/logger"

export async function GET(req) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, Number(searchParams.get("page")   || 1))
  const status   = searchParams.get("status") || ""
  const search   = searchParams.get("q")      || ""
  const PAGE_SIZE = 20
  const offset   = (page - 1) * PAGE_SIZE

  let rows, countRows
  if (status && search) {
    rows      = await sql`SELECT id, slug, title, status, category, view_count, published_at, created_at, updated_at FROM articles WHERE status = ${status}::"ArticleStatus" AND (title ILIKE ${"%" + search + "%"} OR excerpt ILIKE ${"%" + search + "%"}) ORDER BY updated_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM articles WHERE status = ${status}::"ArticleStatus" AND (title ILIKE ${"%" + search + "%"} OR excerpt ILIKE ${"%" + search + "%"})`
  } else if (status) {
    rows      = await sql`SELECT id, slug, title, status, category, view_count, published_at, created_at, updated_at FROM articles WHERE status = ${status}::"ArticleStatus" ORDER BY updated_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM articles WHERE status = ${status}::"ArticleStatus"`
  } else if (search) {
    rows      = await sql`SELECT id, slug, title, status, category, view_count, published_at, created_at, updated_at FROM articles WHERE title ILIKE ${"%" + search + "%"} OR excerpt ILIKE ${"%" + search + "%"} ORDER BY updated_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM articles WHERE title ILIKE ${"%" + search + "%"} OR excerpt ILIKE ${"%" + search + "%"}`
  } else {
    rows      = await sql`SELECT id, slug, title, status, category, view_count, published_at, created_at, updated_at FROM articles ORDER BY updated_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM articles`
  }

  return NextResponse.json({
    articles:   rows,
    total:      Number(countRows[0]?.c ?? 0),
    totalPages: Math.ceil(Number(countRows[0]?.c ?? 0) / PAGE_SIZE),
    page,
  })
}

export async function POST(req) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  // Zod validation
  const parsed = articleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const d = parsed.data

  const exist = await sql`SELECT id FROM articles WHERE slug = ${d.slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })

  const safeContent = d.content ? sanitizeHtml(d.content) : null
  const publishedAt = d.status === "PUBLISHED" ? new Date() : null

  try {
    const rows = await sql`
      INSERT INTO articles
        (title, slug, excerpt, content, cover_image, status, category, tags, meta_title, meta_desc, published_at)
      VALUES
        (${d.title}, ${d.slug}, ${d.excerpt || null}, ${safeContent},
         ${d.coverImage || null}, ${d.status}::"ArticleStatus",
         ${d.category   || null}, ${d.tags},
         ${d.metaTitle  || null}, ${d.metaDesc || null},
         ${publishedAt})
      RETURNING id, slug
    `
    return NextResponse.json({ success: true, article: rows[0] }, { status: 201 })
  } catch (err) {
    logger.error("POST /api/admin/articles failed", err)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}