// src/app/api/admin/events/[id]/route.js
// GET  /api/admin/events/[id] — lấy chi tiết event để edit
// PATCH /api/admin/events/[id] — cập nhật event (bao gồm content)

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import sql from "@/lib/db"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") return null
  return session
}

export async function GET(req, { params }) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const rows = await sql`SELECT * FROM events WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy." }, { status: 404 })
  return NextResponse.json({ event: rows[0] })
}

export async function PATCH(req, { params }) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params

  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ." }, { status: 400 }) }

  const {
    title, slug, type, status, short_desc,
    description, content, location,
    is_online, max_attendees, is_published, is_featured,
  } = body

  await sql`
    UPDATE events SET
      title        = ${title        ?? null},
      slug         = ${slug         ?? null},
      type         = ${type         ?? null}::"EventType",
      status       = ${status       ?? null}::"EventStatus",
      short_desc   = ${short_desc   ?? null},
      description  = ${description  ?? null},
      content      = ${content      || null},
      location     = ${location     ?? null},
      is_online    = ${is_online    ?? false},
      max_attendees = ${max_attendees ? Number(max_attendees) : null},
      is_published = ${is_published ?? false},
      is_featured  = ${is_featured  ?? false},
      updated_at   = now()
    WHERE id = ${id}
  `
  return NextResponse.json({ success: true })
}