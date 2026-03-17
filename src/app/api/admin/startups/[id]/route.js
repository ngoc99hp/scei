// src/app/api/admin/startups/[id]/route.js
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
  const rows = await sql`SELECT * FROM startups WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ startup: rows[0] })
}
export async function PATCH(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }
  const { name, slug, tagline, description, website, industry, stage, status, founded_year, team_size, funding_raised, cover_image, logo, founder_name, founder_email, founder_linkedin, linkedin_url, facebook_url, tags, is_published, is_featured, display_order } = body
  await sql`UPDATE startups SET name=${name||null}, slug=${slug||null}, tagline=${tagline||null}, description=${description||null}, website=${website||null}, industry=${industry||null}, stage=${stage}::"StartupStage", status=${status}::"StartupStatus", founded_year=${founded_year?Number(founded_year):null}, team_size=${team_size?Number(team_size):null}, funding_raised=${funding_raised||null}, cover_image=${cover_image||null}, logo=${logo||null}, founder_name=${founder_name||null}, founder_email=${founder_email||null}, founder_linkedin=${founder_linkedin||null}, linkedin_url=${linkedin_url||null}, facebook_url=${facebook_url||null}, tags=${JSON.stringify(tags??[])}, is_published=${is_published??false}, is_featured=${is_featured??false}, display_order=${display_order??0}, updated_at=now() WHERE id=${id}`
  return NextResponse.json({ success: true })
}
export async function DELETE(req, { params }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await sql`DELETE FROM startups WHERE id = ${id}`
  return NextResponse.json({ success: true })
}