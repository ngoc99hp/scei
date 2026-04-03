// src/app/api/admin/resources/[id]/route.js
import { NextResponse }              from "next/server"
import sql                           from "@/lib/db"
import { requireApiAdmin }           from "@/lib/auth"
import { resourceSchema }            from "@/lib/validations"
import { logger }                    from "@/lib/logger"
import { deleteImage, extractPublicId } from "@/lib/cloudinary"

export async function GET(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  const rows = await sql`SELECT * FROM resources WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ resource: rows[0] })
}

export async function PATCH(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
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

  const current  = await sql`SELECT cover_image FROM resources WHERE id = ${id} LIMIT 1`
  const oldImage = current[0]?.cover_image ?? null

  try {
    await sql`
      UPDATE resources SET
        title        = ${d.title},
        slug         = ${d.slug},
        description  = ${d.description ?? null},
        type         = ${d.type}::"ResourceType",
        file_url     = ${d.fileUrl     ?? null},
        external_url = ${d.externalUrl ?? null},
        cover_image  = ${d.coverImage  ?? null},
        category     = ${d.category    ?? null},
        tags         = ${d.tags},
        is_published = ${d.isPublished},
        is_featured  = ${d.isFeatured},
        updated_at   = now()
      WHERE id = ${id}
    `

    if (oldImage && oldImage !== d.coverImage) {
      const pid = extractPublicId(oldImage)
      if (pid) deleteImage(pid).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error("PATCH /api/admin/resources/[id] failed", err, { id })
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params

  const current    = await sql`SELECT cover_image FROM resources WHERE id = ${id} LIMIT 1`
  const coverImage = current[0]?.cover_image ?? null

  await sql`DELETE FROM resources WHERE id = ${id}`

  if (coverImage) {
    const pid = extractPublicId(coverImage)
    if (pid) deleteImage(pid).catch(() => {})
  }

  return NextResponse.json({ success: true })
}