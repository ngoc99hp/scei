// src/app/api/admin/events/route.js
// GET  — danh sách events (admin, bao gồm cả unpublished)
// POST — tạo mới

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
  if (!await requireAdmin())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page    = Math.max(1, Number(searchParams.get("page") || 1))
  const status  = searchParams.get("status") || ""
  const search  = searchParams.get("q")      || ""
  const PAGE_SIZE = 20
  const offset  = (page - 1) * PAGE_SIZE

  let rows, countRows
  if (status && search) {
    rows = await sql`
      SELECT id, slug, title, type, status, is_published, is_featured,
             start_date, max_attendees, registered_count, created_at
      FROM events
      WHERE status = ${status}::"EventStatus"
        AND title ILIKE ${"%" + search + "%"}
      ORDER BY start_date DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `
    countRows = await sql`
      SELECT COUNT(*) c FROM events
      WHERE status = ${status}::"EventStatus" AND title ILIKE ${"%" + search + "%"}
    `
  } else if (status) {
    rows = await sql`
      SELECT id, slug, title, type, status, is_published, is_featured,
             start_date, max_attendees, registered_count, created_at
      FROM events WHERE status = ${status}::"EventStatus"
      ORDER BY start_date DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `
    countRows = await sql`SELECT COUNT(*) c FROM events WHERE status = ${status}::"EventStatus"`
  } else if (search) {
    rows = await sql`
      SELECT id, slug, title, type, status, is_published, is_featured,
             start_date, max_attendees, registered_count, created_at
      FROM events WHERE title ILIKE ${"%" + search + "%"}
      ORDER BY start_date DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `
    countRows = await sql`SELECT COUNT(*) c FROM events WHERE title ILIKE ${"%" + search + "%"}`
  } else {
    rows = await sql`
      SELECT id, slug, title, type, status, is_published, is_featured,
             start_date, max_attendees, registered_count, created_at
      FROM events ORDER BY start_date DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `
    countRows = await sql`SELECT COUNT(*) c FROM events`
  }

  return NextResponse.json({
    events: rows,
    total: Number(countRows[0]?.c ?? 0),
    totalPages: Math.ceil(Number(countRows[0]?.c ?? 0) / PAGE_SIZE),
    page,
  })
}

export async function POST(req) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const {
    title, slug, type = "WORKSHOP", status = "DRAFT",
    short_desc, description, content, cover_image,
    start_date, end_date, register_deadline,
    is_online = false, location, online_link,
    max_attendees, tags = [],
    is_published = false, is_featured = false,
  } = body

  if (!title?.trim()) return NextResponse.json({ error: "Tiêu đề là bắt buộc" }, { status: 422 })
  if (!slug?.trim())  return NextResponse.json({ error: "Slug là bắt buộc" }, { status: 422 })

  const exist = await sql`SELECT id FROM events WHERE slug = ${slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })

  const rows = await sql`
    INSERT INTO events
      (title, slug, type, status, short_desc, description, content, cover_image,
       start_date, end_date, register_deadline, is_online, location, online_link,
       max_attendees, tags, is_published, is_featured)
    VALUES
      (${title.trim()}, ${slug.trim()}, ${type}::"EventType", ${status}::"EventStatus",
       ${short_desc || null}, ${description || null}, ${content || null}, ${cover_image || null},
       ${start_date || null}, ${end_date || null}, ${register_deadline || null},
       ${is_online}, ${location || null}, ${online_link || null},
       ${max_attendees ? Number(max_attendees) : null},
       ${JSON.stringify(tags)}, ${is_published}, ${is_featured})
    RETURNING id, slug
  `
  return NextResponse.json({ success: true, event: rows[0] }, { status: 201 })
}