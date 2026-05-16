// src/app/api/admin/mentors/[id]/route.js
import { NextResponse }              from "next/server"
import sql                           from "@/lib/db"
import { requireApiAdmin }           from "@/lib/auth"
import { mentorSchema }              from "@/lib/validations"
import { logger }                    from "@/lib/logger"
import { deleteImage, extractPublicId } from "@/lib/cloudinary"

export async function GET(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  const rows = await sql`SELECT * FROM mentors WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ mentor: rows[0] })
}

export async function PATCH(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const parsed = mentorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const d = parsed.data

  const current  = await sql`SELECT avatar FROM mentors WHERE id = ${id} LIMIT 1`
  const oldAvatar = current[0]?.avatar ?? null

  const expertiseTags = d.expertise
    ? d.expertise.split(",").map(s => s.trim()).filter(Boolean)
    : null

  try {
    await sql`
      UPDATE mentors SET
        name         = ${d.name},
        slug         = ${d.slug},
        title        = ${d.title        ?? ""},
        organization = ${d.organization ?? ""},
        expertise    = ${expertiseTags},
        bio          = ${d.bio          ?? ""},
        short_bio    = ${d.shortBio     ?? ""},
        email        = ${d.email        ?? null},
        linkedin_url = ${d.linkedinUrl  ?? null},
        facebook_url = ${d.facebookUrl  ?? null},
        website      = ${d.website      ?? null},
        years_exp    = ${d.yearsExp     ?? null},
        avatar       = ${d.avatar       ?? null},
        tags         = ${d.tags},
        status       = ${d.status}::"MentorStatus",
        is_published = ${d.isPublished},
        is_featured  = ${d.isFeatured},
        display_order = ${d.displayOrder},
        updated_at   = now()
      WHERE id = ${id}
    `

    if (oldAvatar && oldAvatar !== d.avatar) {
      const pid = extractPublicId(oldAvatar)
      if (pid) deleteImage(pid).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error("PATCH /api/admin/mentors/[id] failed", err, { id })
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params

  const current = await sql`SELECT avatar FROM mentors WHERE id = ${id} LIMIT 1`
  const avatar  = current[0]?.avatar ?? null

  await sql`DELETE FROM mentors WHERE id = ${id}`

  if (avatar) {
    const pid = extractPublicId(avatar)
    if (pid) deleteImage(pid).catch(() => {})
  }

  return NextResponse.json({ success: true })
}