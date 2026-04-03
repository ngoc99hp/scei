// src/app/api/admin/users/[id]/route.js
import { NextResponse }    from "next/server"
import sql                 from "@/lib/db"
import bcrypt              from "bcryptjs"
import { requireApiAdmin } from "@/lib/auth"
import { z }               from "zod"
import { logger }          from "@/lib/logger"

const patchUserSchema = z.object({
  name:      z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
  password:  z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").optional(),
})

export async function PATCH(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const parsed = patchUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { name, is_active, password } = parsed.data

  try {
    if (password !== undefined) {
      const hash = await bcrypt.hash(password, 12)
      await sql`UPDATE users SET password_hash = ${hash}, updated_at = now() WHERE id = ${id}`
    }
    if (is_active !== undefined) {
      await sql`UPDATE users SET is_active = ${is_active}, updated_at = now() WHERE id = ${id}`
    }
    if (name !== undefined) {
      await sql`UPDATE users SET name = ${name}, updated_at = now() WHERE id = ${id}`
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error("PATCH /api/admin/users/[id] failed", err, { id })
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}