// src/app/api/admin/mentors/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import sql from "@/lib/db"

async function requireAdmin() {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role !== "ADMIN") return null
  return s
}
export async function GET(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const status = searchParams.get("status") || ""
  const search = searchParams.get("q") || ""
  const PAGE_SIZE = 20
  const offset = (page - 1) * PAGE_SIZE
  let rows, countRows
  if (status && search) {
    rows = await sql`SELECT id, slug, name, avatar, title, organization, status, is_published, is_featured, years_exp, created_at FROM mentors WHERE status = ${status}::"MentorStatus" AND name ILIKE ${"%" + search + "%"} ORDER BY display_order ASC, created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM mentors WHERE status = ${status}::"MentorStatus" AND name ILIKE ${"%" + search + "%"}`
  } else if (status) {
    rows = await sql`SELECT id, slug, name, avatar, title, organization, status, is_published, is_featured, years_exp, created_at FROM mentors WHERE status = ${status}::"MentorStatus" ORDER BY display_order ASC, created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM mentors WHERE status = ${status}::"MentorStatus"`
  } else if (search) {
    rows = await sql`SELECT id, slug, name, avatar, title, organization, status, is_published, is_featured, years_exp, created_at FROM mentors WHERE name ILIKE ${"%" + search + "%"} ORDER BY display_order ASC, created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM mentors WHERE name ILIKE ${"%" + search + "%"}`
  } else {
    rows = await sql`SELECT id, slug, name, avatar, title, organization, status, is_published, is_featured, years_exp, created_at FROM mentors ORDER BY display_order ASC, created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM mentors`
  }
  return NextResponse.json({ mentors: rows, total: Number(countRows[0]?.c ?? 0), totalPages: Math.ceil(Number(countRows[0]?.c ?? 0) / PAGE_SIZE), page })
}
export async function POST(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }
  const { name, slug, title, organization, expertise, bio, short_bio, email, linkedin_url, facebook_url, website, years_exp, avatar, tags = [], status = "ACTIVE", is_published = false, is_featured = false, display_order = 0 } = body
  if (!name?.trim()) return NextResponse.json({ error: "Tên mentor là bắt buộc" }, { status: 422 })
  if (!slug?.trim()) return NextResponse.json({ error: "Slug là bắt buộc" }, { status: 422 })
  const exist = await sql`SELECT id FROM mentors WHERE slug = ${slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })
  const rows = await sql`
    INSERT INTO mentors (name, slug, title, organization, expertise, bio, short_bio, email, linkedin_url, facebook_url, website, years_exp, avatar, tags, status, is_published, is_featured, display_order)
    VALUES (${name.trim()}, ${slug.trim()}, ${title || null}, ${organization || null}, ${expertise || null}, ${bio || null}, ${short_bio || null}, ${email || null}, ${linkedin_url || null}, ${facebook_url || null}, ${website || null}, ${years_exp ? Number(years_exp) : null}, ${avatar || null}, ${JSON.stringify(tags)}, ${status}::"MentorStatus", ${is_published}, ${is_featured}, ${display_order})
    RETURNING id, slug
  `
  return NextResponse.json({ success: true, mentor: rows[0] }, { status: 201 })
}