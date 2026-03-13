// src/app/api/admin/articles/route.js
// GET  /api/admin/articles  — danh sách (filter + paginate)
// POST /api/admin/articles  — tạo mới

import { NextResponse }    from "next/server"
import { getServerSession } from "next-auth"
import { authOptions }     from "@/lib/auth.config"
import sql                 from "@/lib/db"
import { sanitizeHtml }    from "@/lib/sanitize"

async function requireAdmin() {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role !== "ADMIN") return null
  return s
}

// ── GET ───────────────────────────────────────────────────────
export async function GET(req) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page    = Math.max(1, Number(searchParams.get("page")  || 1))
  const status  = searchParams.get("status") || ""   // DRAFT | PUBLISHED | ARCHIVED
  const search  = searchParams.get("q")      || ""
  const PAGE_SIZE = 20

  const offset = (page - 1) * PAGE_SIZE

  // Build rows
  let rows, countRows
  if (status && search) {
    rows = await sql`
      SELECT id, slug, title, status, category, view_count, published_at, created_at, updated_at
      FROM articles
      WHERE status = ${status}::"ArticleStatus"
        AND (title ILIKE ${"%" + search + "%"} OR excerpt ILIKE ${"%" + search + "%"})
      ORDER BY updated_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `
    countRows = await sql`
      SELECT COUNT(*) c FROM articles
      WHERE status = ${status}::"ArticleStatus"
        AND (title ILIKE ${"%" + search + "%"} OR excerpt ILIKE ${"%" + search + "%"})
    `
  } else if (status) {
    rows = await sql`
      SELECT id, slug, title, status, category, view_count, published_at, created_at, updated_at
      FROM articles WHERE status = ${status}::"ArticleStatus"
      ORDER BY updated_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `
    countRows = await sql`SELECT COUNT(*) c FROM articles WHERE status = ${status}::"ArticleStatus"`
  } else if (search) {
    rows = await sql`
      SELECT id, slug, title, status, category, view_count, published_at, created_at, updated_at
      FROM articles
      WHERE title ILIKE ${"%" + search + "%"} OR excerpt ILIKE ${"%" + search + "%"}
      ORDER BY updated_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `
    countRows = await sql`
      SELECT COUNT(*) c FROM articles
      WHERE title ILIKE ${"%" + search + "%"} OR excerpt ILIKE ${"%" + search + "%"}
    `
  } else {
    rows = await sql`
      SELECT id, slug, title, status, category, view_count, published_at, created_at, updated_at
      FROM articles ORDER BY updated_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `
    countRows = await sql`SELECT COUNT(*) c FROM articles`
  }

  const total      = Number(countRows[0]?.c ?? 0)
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return NextResponse.json({ articles: rows, total, totalPages, page })
}

// ── POST ──────────────────────────────────────────────────────
export async function POST(req) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const {
    title, slug, excerpt, content, cover_image,
    status = "DRAFT", category = "", tags = [],
    meta_title = "", meta_desc = "",
  } = body

  if (!title?.trim()) return NextResponse.json({ error: "Tiêu đề là bắt buộc" }, { status: 422 })
  if (!slug?.trim())  return NextResponse.json({ error: "Slug là bắt buộc" }, { status: 422 })

  // Kiểm tra slug trùng
  const exist = await sql`SELECT id FROM articles WHERE slug = ${slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })

  const safeContent = content ? sanitizeHtml(content) : null
  const publishedAt = status === "PUBLISHED" ? new Date() : null

  const rows = await sql`
    INSERT INTO articles
      (title, slug, excerpt, content, cover_image, status, category, tags, meta_title, meta_desc, published_at)
    VALUES
      (${title.trim()}, ${slug.trim()}, ${excerpt || null}, ${safeContent},
       ${cover_image || null}, ${status}::"ArticleStatus",
       ${category || null}, ${JSON.stringify(tags)},
       ${meta_title || null}, ${meta_desc || null},
       ${publishedAt})
    RETURNING id, slug
  `

  return NextResponse.json({ success: true, article: rows[0] }, { status: 201 })
}