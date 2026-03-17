// src/app/api/admin/resources/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import sql from "@/lib/db"

async function requireAdmin() {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role !== "ADMIN") return null
  return s
}

export async function GET(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const type = searchParams.get("type") || ""
  const search = searchParams.get("q") || ""
  const PAGE_SIZE = 20
  const offset = (page - 1) * PAGE_SIZE

  let rows, countRows
  if (type && search) {
    rows = await sql`SELECT id, slug, title, type, category, is_published, is_featured, download_count, created_at FROM resources WHERE type = ${type}::"ResourceType" AND title ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM resources WHERE type = ${type}::"ResourceType" AND title ILIKE ${"%" + search + "%"}`
  } else if (type) {
    rows = await sql`SELECT id, slug, title, type, category, is_published, is_featured, download_count, created_at FROM resources WHERE type = ${type}::"ResourceType" ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM resources WHERE type = ${type}::"ResourceType"`
  } else if (search) {
    rows = await sql`SELECT id, slug, title, type, category, is_published, is_featured, download_count, created_at FROM resources WHERE title ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM resources WHERE title ILIKE ${"%" + search + "%"}`
  } else {
    rows = await sql`SELECT id, slug, title, type, category, is_published, is_featured, download_count, created_at FROM resources ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM resources`
  }
  return NextResponse.json({ resources: rows, total: Number(countRows[0]?.c ?? 0), totalPages: Math.ceil(Number(countRows[0]?.c ?? 0) / PAGE_SIZE), page })
}

export async function POST(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }
  const { title, slug, description, type = "DOCUMENT", file_url, external_url, cover_image, category, tags = [], is_published = false, is_featured = false } = body
  if (!title?.trim()) return NextResponse.json({ error: "Tiêu đề là bắt buộc" }, { status: 422 })
  if (!slug?.trim()) return NextResponse.json({ error: "Slug là bắt buộc" }, { status: 422 })
  if (!file_url && !external_url) return NextResponse.json({ error: "Cần có file hoặc URL" }, { status: 422 })
  const exist = await sql`SELECT id FROM resources WHERE slug = ${slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })
  const rows = await sql`
    INSERT INTO resources (title, slug, description, type, file_url, external_url, cover_image, category, tags, is_published, is_featured)
    VALUES (${title.trim()}, ${slug.trim()}, ${description || null}, ${type}::"ResourceType", ${file_url || null}, ${external_url || null}, ${cover_image || null}, ${category || null}, ${JSON.stringify(tags)}, ${is_published}, ${is_featured})
    RETURNING id, slug
  `
  return NextResponse.json({ success: true, resource: rows[0] }, { status: 201 })
}