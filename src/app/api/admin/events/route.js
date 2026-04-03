// src/app/api/admin/events/route.js
import { NextResponse }    from "next/server"
import sql                 from "@/lib/db"
import { requireApiAdmin } from "@/lib/auth"
import { eventSchema }     from "@/lib/validations"
import { logger }          from "@/lib/logger"

export async function GET(req) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, Number(searchParams.get("page") || 1))
  const status   = searchParams.get("status") || ""
  const search   = searchParams.get("q")      || ""
  const PAGE_SIZE = 20
  const offset   = (page - 1) * PAGE_SIZE

  let rows, countRows
  if (status && search) {
    rows      = await sql`SELECT id, slug, title, type, status, is_published, is_featured, start_date, max_attendees, registered_count, created_at FROM events WHERE status = ${status}::"EventStatus" AND title ILIKE ${"%" + search + "%"} ORDER BY start_date DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM events WHERE status = ${status}::"EventStatus" AND title ILIKE ${"%" + search + "%"}`
  } else if (status) {
    rows      = await sql`SELECT id, slug, title, type, status, is_published, is_featured, start_date, max_attendees, registered_count, created_at FROM events WHERE status = ${status}::"EventStatus" ORDER BY start_date DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM events WHERE status = ${status}::"EventStatus"`
  } else if (search) {
    rows      = await sql`SELECT id, slug, title, type, status, is_published, is_featured, start_date, max_attendees, registered_count, created_at FROM events WHERE title ILIKE ${"%" + search + "%"} ORDER BY start_date DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM events WHERE title ILIKE ${"%" + search + "%"}`
  } else {
    rows      = await sql`SELECT id, slug, title, type, status, is_published, is_featured, start_date, max_attendees, registered_count, created_at FROM events ORDER BY start_date DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM events`
  }

  return NextResponse.json({
    events:     rows,
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
  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const d = parsed.data

  const exist = await sql`SELECT id FROM events WHERE slug = ${d.slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })

  try {
    const rows = await sql`
      INSERT INTO events
        (title, slug, type, status, short_desc, description, content, cover_image,
         start_date, end_date, register_deadline, is_online, location, online_link,
         max_attendees, tags, is_published, is_featured)
      VALUES
        (${d.title}, ${d.slug}, ${d.type}::"EventType", ${d.status}::"EventStatus",
         ${d.shortDesc   || null}, ${d.description || null}, ${d.content || null}, ${d.coverImage || null},
         ${d.startDate}, ${d.endDate || null}, ${d.registerDeadline || null},
         ${d.isOnline}, ${d.location || null}, ${d.onlineLink || null},
         ${d.maxAttendees ?? null}, ${d.tags},
         ${d.isPublished}, ${d.isFeatured})
      RETURNING id, slug
    `
    return NextResponse.json({ success: true, event: rows[0] }, { status: 201 })
  } catch (err) {
    logger.error("POST /api/admin/events failed", err)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}