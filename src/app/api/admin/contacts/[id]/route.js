// src/app/api/admin/contacts/[id]/route.js
import { NextResponse }    from "next/server"
import sql                 from "@/lib/db"
import { requireApiAdmin } from "@/lib/auth"
import { z }               from "zod"
import { logger }          from "@/lib/logger"

const patchContactSchema = z.object({
  status:     z.enum(["NEW", "READING", "REPLIED", "IGNORED"]),
  admin_note: z.string().max(2000).optional().or(z.literal("")),
})

export async function GET(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  const rows = await sql`SELECT * FROM contacts WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ contact: rows[0] })
}

export async function PATCH(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const parsed = patchContactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { status, admin_note } = parsed.data
  const repliedAt = status === "REPLIED" ? new Date() : null

  try {
    await sql`
      UPDATE contacts SET
        status     = ${status}::"ContactStatus",
        admin_note = ${admin_note || null},
        replied_at = ${repliedAt},
        updated_at = now()
      WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error("PATCH /api/admin/contacts/[id] failed", err, { id })
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  await sql`DELETE FROM contacts WHERE id = ${id}`
  return NextResponse.json({ success: true })
}