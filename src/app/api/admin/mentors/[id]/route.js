// src/app/api/admin/mentors/[id]/route.js
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
  const rows = await sql`SELECT * FROM mentors WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ mentor: rows[0] })
}
export async function PATCH(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }
  const { name, slug, title, organization, expertise, bio, short_bio, email, linkedin_url, facebook_url, website, years_exp, avatar, tags, status, is_published, is_featured, display_order } = body
  await sql`UPDATE mentors SET name=${name||null}, slug=${slug||null}, title=${title||null}, organization=${organization||null}, expertise=${expertise||null}, bio=${bio||null}, short_bio=${short_bio||null}, email=${email||null}, linkedin_url=${linkedin_url||null}, facebook_url=${facebook_url||null}, website=${website||null}, years_exp=${years_exp?Number(years_exp):null}, avatar=${avatar||null}, tags=${JSON.stringify(tags??[])}, status=${status}::"MentorStatus", is_published=${is_published??false}, is_featured=${is_featured??false}, display_order=${display_order??0}, updated_at=now() WHERE id=${id}`
  return NextResponse.json({ success: true })
}
export async function DELETE(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await sql`DELETE FROM mentors WHERE id = ${id}`
  return NextResponse.json({ success: true })
}