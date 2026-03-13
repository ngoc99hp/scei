// src/app/api/admin/users/[id]/route.js
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
export async function PATCH(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }
  const { is_active, name, password } = body
  if (password !== undefined) {
    if (password.length < 8) return NextResponse.json({ error: "Mật khẩu tối thiểu 8 ký tự" }, { status: 422 })
    const hash = await bcrypt.hash(password, 12)
    await sql`UPDATE users SET password_hash=${hash}, updated_at=now() WHERE id=${id}`
  }
  if (is_active !== undefined) {
    await sql`UPDATE users SET is_active=${is_active}, updated_at=now() WHERE id=${id}`
  }
  if (name !== undefined) {
    await sql`UPDATE users SET name=${name}, updated_at=now() WHERE id=${id}`
  }
  return NextResponse.json({ success: true })
}