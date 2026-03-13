// src/app/api/admin/programs/route.js
import { NextResponse }    from "next/server"
import { getServerSession } from "next-auth"
import { authOptions }     from "@/lib/auth.config"
import sql                 from "@/lib/db"

async function requireAdmin() {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role !== "ADMIN") return null
  return s
}

export async function GET(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const status = searchParams.get("status") || ""
  const search = searchParams.get("q") || ""
  const PAGE_SIZE = 20
  const offset = (page - 1) * PAGE_SIZE

  let rows, countRows
  if (status && search) {
    rows = await sql`SELECT id, slug, name, type, status, is_published, is_featured, apply_deadline, max_applicants, created_at FROM programs WHERE status = ${status}::"ProgramStatus" AND name ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM programs WHERE status = ${status}::"ProgramStatus" AND name ILIKE ${"%" + search + "%"}`
  } else if (status) {
    rows = await sql`SELECT id, slug, name, type, status, is_published, is_featured, apply_deadline, max_applicants, created_at FROM programs WHERE status = ${status}::"ProgramStatus" ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM programs WHERE status = ${status}::"ProgramStatus"`
  } else if (search) {
    rows = await sql`SELECT id, slug, name, type, status, is_published, is_featured, apply_deadline, max_applicants, created_at FROM programs WHERE name ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM programs WHERE name ILIKE ${"%" + search + "%"}`
  } else {
    rows = await sql`SELECT id, slug, name, type, status, is_published, is_featured, apply_deadline, max_applicants, created_at FROM programs ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM programs`
  }

  return NextResponse.json({ programs: rows, total: Number(countRows[0]?.c ?? 0), totalPages: Math.ceil(Number(countRows[0]?.c ?? 0) / PAGE_SIZE), page })
}

export async function POST(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const { name, slug, type = "INCUBATION", status = "DRAFT", short_desc, description, content, benefits, requirements, cover_image, start_date, end_date, apply_deadline, max_applicants, is_published = false, is_featured = false, display_order = 0 } = body

  if (!name?.trim()) return NextResponse.json({ error: "Tên chương trình là bắt buộc" }, { status: 422 })
  if (!slug?.trim()) return NextResponse.json({ error: "Slug là bắt buộc" }, { status: 422 })
  const exist = await sql`SELECT id FROM programs WHERE slug = ${slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })

  const rows = await sql`
    INSERT INTO programs (name, slug, type, status, short_desc, description, content, benefits, requirements, cover_image, start_date, end_date, apply_deadline, max_applicants, is_published, is_featured, display_order)
    VALUES (${name.trim()}, ${slug.trim()}, ${type}::"ProgramType", ${status}::"ProgramStatus", ${short_desc || null}, ${description || null}, ${content || null}, ${benefits || null}, ${requirements || null}, ${cover_image || null}, ${start_date || null}, ${end_date || null}, ${apply_deadline || null}, ${max_applicants ? Number(max_applicants) : null}, ${is_published}, ${is_featured}, ${display_order})
    RETURNING id, slug
  `
  return NextResponse.json({ success: true, program: rows[0] }, { status: 201 })
}