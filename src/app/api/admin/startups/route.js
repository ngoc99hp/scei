// src/app/api/admin/startups/route.js
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
    rows = await sql`SELECT id, slug, name, logo, stage, status, industry, is_published, is_featured, founded_year, created_at FROM startups WHERE status = ${status}::"StartupStatus" AND name ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM startups WHERE status = ${status}::"StartupStatus" AND name ILIKE ${"%" + search + "%"}`
  } else if (status) {
    rows = await sql`SELECT id, slug, name, logo, stage, status, industry, is_published, is_featured, founded_year, created_at FROM startups WHERE status = ${status}::"StartupStatus" ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM startups WHERE status = ${status}::"StartupStatus"`
  } else if (search) {
    rows = await sql`SELECT id, slug, name, logo, stage, status, industry, is_published, is_featured, founded_year, created_at FROM startups WHERE name ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM startups WHERE name ILIKE ${"%" + search + "%"}`
  } else {
    rows = await sql`SELECT id, slug, name, logo, stage, status, industry, is_published, is_featured, founded_year, created_at FROM startups ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM startups`
  }
  return NextResponse.json({ startups: rows, total: Number(countRows[0]?.c ?? 0), totalPages: Math.ceil(Number(countRows[0]?.c ?? 0) / PAGE_SIZE), page })
}

export async function POST(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }
  const { name, slug, tagline, description, website, industry, stage = "IDEA", status = "INCUBATING", founded_year, team_size, funding_raised, cover_image, logo, founder_name, founder_email, founder_linkedin, linkedin_url, facebook_url, tags = [], is_published = false, is_featured = false, display_order = 0 } = body
  if (!name?.trim()) return NextResponse.json({ error: "Tên startup là bắt buộc" }, { status: 422 })
  if (!slug?.trim()) return NextResponse.json({ error: "Slug là bắt buộc" }, { status: 422 })
  const exist = await sql`SELECT id FROM startups WHERE slug = ${slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })
  const rows = await sql`
    INSERT INTO startups (name, slug, tagline, description, website, industry, stage, status, founded_year, team_size, funding_raised, cover_image, logo, founder_name, founder_email, founder_linkedin, linkedin_url, facebook_url, tags, is_published, is_featured, display_order)
    VALUES (${name.trim()}, ${slug.trim()}, ${tagline || null}, ${description || null}, ${website || null}, ${industry || null}, ${stage}::"StartupStage", ${status}::"StartupStatus", ${founded_year ? Number(founded_year) : null}, ${team_size ? Number(team_size) : null}, ${funding_raised || null}, ${cover_image || null}, ${logo || null}, ${founder_name || null}, ${founder_email || null}, ${founder_linkedin || null}, ${linkedin_url || null}, ${facebook_url || null}, ${JSON.stringify(tags)}, ${is_published}, ${is_featured}, ${display_order})
    RETURNING id, slug
  `
  return NextResponse.json({ success: true, startup: rows[0] }, { status: 201 })
}