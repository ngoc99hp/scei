// src/app/api/admin/events/[id]/route.js — GIỮ NGUYÊN file cũ, thêm DELETE
// (File này đã có GET + PATCH, chỉ cần thêm DELETE)
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import sql from "@/lib/db"

async function requireAdmin() {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role !== "ADMIN") return null
  return s
}
export async function GET(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const rows = await sql`SELECT * FROM events WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ event: rows[0] })
}
export async function PATCH(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }
  const { title, slug, type, status, short_desc, description, content, cover_image, start_date, end_date, register_deadline, is_online, location, online_link, max_attendees, tags, is_published, is_featured } = body
  await sql`UPDATE events SET title=${title||null}, slug=${slug||null}, type=${type}::"EventType", status=${status}::"EventStatus", short_desc=${short_desc||null}, description=${description||null}, content=${content||null}, cover_image=${cover_image||null}, start_date=${start_date||null}, end_date=${end_date||null}, register_deadline=${register_deadline||null}, is_online=${is_online??false}, location=${location||null}, online_link=${online_link||null}, max_attendees=${max_attendees?Number(max_attendees):null}, tags=${JSON.stringify(tags??[])}, is_published=${is_published??false}, is_featured=${is_featured??false}, updated_at=now() WHERE id=${id}`
  return NextResponse.json({ success: true })
}
export async function DELETE(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  // Xóa event_registrations trước (FK constraint)
  await sql`DELETE FROM event_registrations WHERE event_id = ${id}`
  await sql`DELETE FROM event_mentors     WHERE event_id  = ${id}`
  await sql`DELETE FROM event_startups    WHERE event_id  = ${id}`
  await sql`DELETE FROM events            WHERE id        = ${id}`
  return NextResponse.json({ success: true })
}