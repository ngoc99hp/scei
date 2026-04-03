// src/app/api/admin/events/[id]/route.js
import { NextResponse }              from "next/server"
import sql                           from "@/lib/db"
import { requireApiAdmin }           from "@/lib/auth"
import { eventSchema }               from "@/lib/validations"
import { logger }                    from "@/lib/logger"
import { deleteImage, extractPublicId } from "@/lib/cloudinary"

export async function GET(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  const rows = await sql`SELECT * FROM events WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ event: rows[0] })
}

export async function PATCH(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const parsed = eventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const d = parsed.data

  // Lấy ảnh cũ trước khi update
  const current = await sql`SELECT cover_image FROM events WHERE id = ${id} LIMIT 1`
  const oldImage = current[0]?.cover_image ?? null

  try {
    await sql`
      UPDATE events SET
        title             = ${d.title},
        slug              = ${d.slug},
        type              = ${d.type}::"EventType",
        status            = ${d.status}::"EventStatus",
        short_desc        = ${d.shortDesc         ?? null},
        description       = ${d.description       ?? null},
        content           = ${d.content           ?? null},
        cover_image       = ${d.coverImage        ?? null},
        start_date        = ${d.startDate},
        end_date          = ${d.endDate            ?? null},
        register_deadline = ${d.registerDeadline   ?? null},
        is_online         = ${d.isOnline},
        location          = ${d.location           ?? null},
        online_link       = ${d.onlineLink         ?? null},
        max_attendees     = ${d.maxAttendees        ?? null},
        tags              = ${d.tags},
        is_published      = ${d.isPublished},
        is_featured       = ${d.isFeatured},
        updated_at        = now()
      WHERE id = ${id}
    `

    // Xóa ảnh cũ nếu bị thay bằng ảnh khác hoặc bị xóa
    if (oldImage && oldImage !== d.coverImage) {
      const pid = extractPublicId(oldImage)
      if (pid) deleteImage(pid).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error("PATCH /api/admin/events/[id] failed", err, { id })
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params

  // Lấy ảnh trước khi xóa record
  const current = await sql`SELECT cover_image FROM events WHERE id = ${id} LIMIT 1`
  const coverImage = current[0]?.cover_image ?? null

  await sql`DELETE FROM event_registrations WHERE event_id = ${id}`
  await sql`DELETE FROM event_mentors     WHERE event_id  = ${id}`
  await sql`DELETE FROM event_startups    WHERE event_id  = ${id}`
  await sql`DELETE FROM events            WHERE id        = ${id}`

  // Xóa ảnh khỏi Cloudinary sau khi đã xóa record thành công
  if (coverImage) {
    const pid = extractPublicId(coverImage)
    if (pid) deleteImage(pid).catch(() => {})
  }

  return NextResponse.json({ success: true })
}