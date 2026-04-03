// src/app/api/admin/applications/[id]/route.js
import { NextResponse }           from "next/server"
import sql                        from "@/lib/db"
import { requireApiAdmin }        from "@/lib/auth"
import { reviewApplicationSchema } from "@/lib/validations"
import { logger }                 from "@/lib/logger"

export async function GET(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  const rows = await sql`
    SELECT a.*, p.name program_name
    FROM applications a
    LEFT JOIN programs p ON a.program_id = p.id
    WHERE a.id = ${id}
    LIMIT 1
  `
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ application: rows[0] })
}

export async function PATCH(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  // Zod validation — chỉ cho phép update status + review_note
  const parsed = reviewApplicationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { status, reviewNote } = parsed.data

  try {
    await sql`
      UPDATE applications SET
        status      = ${status}::"ApplicationStatus",
        review_note = ${reviewNote || null},
        reviewed_at = now(),
        updated_at  = now()
      WHERE id = ${id}
    `
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error("PATCH /api/admin/applications/[id] failed", err, { id })
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}