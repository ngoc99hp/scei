// src/app/api/admin/users/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import sql from "@/lib/db"
import bcrypt from "bcryptjs"

async function requireAdmin() {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role !== "ADMIN") return null
  return s
}
export async function GET(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rows = await sql`SELECT id, email, name, avatar, is_active, last_login_at, created_at FROM users ORDER BY created_at DESC`
  return NextResponse.json({ users: rows })
}
export async function POST(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }
  const { email, name, password } = body
  if (!email?.trim()) return NextResponse.json({ error: "Email là bắt buộc" }, { status: 422 })
  if (!password || password.length < 8) return NextResponse.json({ error: "Mật khẩu tối thiểu 8 ký tự" }, { status: 422 })
  const exist = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Email đã tồn tại" }, { status: 422 })
  const hash = await bcrypt.hash(password, 12)
  const rows = await sql`INSERT INTO users (email, name, password_hash, is_active) VALUES (${email.toLowerCase()}, ${name||null}, ${hash}, true) RETURNING id, email, name`
  return NextResponse.json({ success: true, user: rows[0] }, { status: 201 })
}