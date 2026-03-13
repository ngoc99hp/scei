// src/app/api/admin/resources/[id]/route.js
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
  const rows = await sql`SELECT * FROM resources WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ resource: rows[0] })
}
export async function PATCH(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }
  const { title, slug, description, type, file_url, external_url, cover_image, category, tags, is_published, is_featured } = body
  await sql`UPDATE resources SET title=${title||null}, slug=${slug||null}, description=${description||null}, type=${type}::"ResourceType", file_url=${file_url||null}, external_url=${external_url||null}, cover_image=${cover_image||null}, category=${category||null}, tags=${JSON.stringify(tags??[])}, is_published=${is_published??false}, is_featured=${is_featured??false}, updated_at=now() WHERE id=${id}`
  return NextResponse.json({ success: true })
}
export async function DELETE(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await sql`DELETE FROM resources WHERE id = ${id}`
  return NextResponse.json({ success: true })
}