// src/app/api/admin/applications/[id]/route.js
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
  const rows = await sql`SELECT a.*, p.name program_name FROM applications a LEFT JOIN programs p ON a.program_id = p.id WHERE a.id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ application: rows[0] })
}
export async function PATCH(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }
  const { status, review_note } = body
  await sql`UPDATE applications SET status=${status}::"ApplicationStatus", review_note=${review_note||null}, reviewed_at=now(), updated_at=now() WHERE id=${id}`
  return NextResponse.json({ success: true })
}


// ─── contacts ────────────────────────────────────────────────
// src/app/api/admin/contacts/route.js  (inline — tạo file riêng khi copy)