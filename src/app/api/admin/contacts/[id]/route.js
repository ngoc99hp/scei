// src/app/api/admin/contacts/[id]/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import sql from "@/lib/db"
async function requireAdmin() {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role !== "ADMIN") return null
  return s
}
export async function GET(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const rows = await sql`SELECT * FROM contacts WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ contact: rows[0] })
}
export async function PATCH(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }
  const { status, admin_note } = body
  const repliedAt = status === "REPLIED" ? new Date() : null
  await sql`UPDATE contacts SET status=${status}::"ContactStatus", admin_note=${admin_note||null}, replied_at=${repliedAt}, updated_at=now() WHERE id=${id}`
  return NextResponse.json({ success: true })
}
export async function DELETE(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await sql`DELETE FROM contacts WHERE id = ${id}`
  return NextResponse.json({ success: true })
}