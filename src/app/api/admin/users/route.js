// src/app/api/admin/users/route.js
import { NextResponse }    from "next/server"
import sql                 from "@/lib/db"
import bcrypt              from "bcryptjs"
import { requireApiAdmin } from "@/lib/auth"
import { z }               from "zod"
import { logger }          from "@/lib/logger"

const createUserSchema = z.object({
  email:    z.string().email("Email không hợp lệ"),
  name:     z.string().min(1).max(100).optional().or(z.literal("")),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
})

export async function GET(req) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const rows = await sql`
    SELECT id, email, name, avatar, is_active, last_login_at, created_at
    FROM users
    ORDER BY created_at DESC
  `
  return NextResponse.json({ users: rows })
}

export async function POST(req) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { email, name, password } = parsed.data

  const exist = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Email đã tồn tại" }, { status: 422 })

  try {
    const hash = await bcrypt.hash(password, 12)
    const rows = await sql`
      INSERT INTO users (email, name, password_hash, is_active)
      VALUES (${email.toLowerCase()}, ${name || null}, ${hash}, true)
      RETURNING id, email, name
    `
    return NextResponse.json({ success: true, user: rows[0] }, { status: 201 })
  } catch (err) {
    logger.error("POST /api/admin/users failed", err)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}