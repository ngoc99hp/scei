// src/app/api/admin/resources/route.js
import { NextResponse }    from "next/server"
import sql                 from "@/lib/db"
import { requireApiAdmin } from "@/lib/auth"
import { resourceSchema }  from "@/lib/validations"
import { logger }          from "@/lib/logger"

export async function GET(req) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, Number(searchParams.get("page") || 1))
  const type     = searchParams.get("type") || ""
  const search   = searchParams.get("q")    || ""
  const PAGE_SIZE = 20
  const offset   = (page - 1) * PAGE_SIZE

  let rows, countRows
  if (type && search) {
    rows      = await sql`SELECT id, slug, title, type, category, is_published, is_featured, download_count, created_at FROM resources WHERE type = ${type}::"ResourceType" AND title ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM resources WHERE type = ${type}::"ResourceType" AND title ILIKE ${"%" + search + "%"}`
  } else if (type) {
    rows      = await sql`SELECT id, slug, title, type, category, is_published, is_featured, download_count, created_at FROM resources WHERE type = ${type}::"ResourceType" ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM resources WHERE type = ${type}::"ResourceType"`
  } else if (search) {
    rows      = await sql`SELECT id, slug, title, type, category, is_published, is_featured, download_count, created_at FROM resources WHERE title ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM resources WHERE title ILIKE ${"%" + search + "%"}`
  } else {
    rows      = await sql`SELECT id, slug, title, type, category, is_published, is_featured, download_count, created_at FROM resources ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM resources`
  }

  return NextResponse.json({
    resources:  rows,
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

  const parsed = resourceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const d = parsed.data

  const exist = await sql`SELECT id FROM resources WHERE slug = ${d.slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })

  try {
    const rows = await sql`
      INSERT INTO resources
        (title, slug, description, type, file_url, external_url,
         cover_image, category, tags, is_published, is_featured)
      VALUES
        (${d.title}, ${d.slug}, ${d.description || null},
         ${d.type}::"ResourceType",
         ${d.fileUrl     || null}, ${d.externalUrl || null},
         ${d.coverImage  || null}, ${d.category    || null},
         ${d.tags}, ${d.isPublished}, ${d.isFeatured})
      RETURNING id, slug
    `
    return NextResponse.json({ success: true, resource: rows[0] }, { status: 201 })
  } catch (err) {
    logger.error("POST /api/admin/resources failed", err)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}