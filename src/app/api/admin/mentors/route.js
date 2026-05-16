// src/app/api/admin/mentors/route.js
import { NextResponse }    from "next/server"
import sql                 from "@/lib/db"
import { requireApiAdmin } from "@/lib/auth"
import { mentorSchema }    from "@/lib/validations"
import { logger }          from "@/lib/logger"

export async function GET(req) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, Number(searchParams.get("page") || 1))
  const status   = searchParams.get("status") || ""
  const search   = searchParams.get("q")      || ""
  const PAGE_SIZE = 20
  const offset   = (page - 1) * PAGE_SIZE

  let rows, countRows
  if (status && search) {
    rows      = await sql`SELECT id, slug, name, avatar, title, organization, status, is_published, is_featured, years_exp, created_at FROM mentors WHERE status = ${status}::"MentorStatus" AND name ILIKE ${"%" + search + "%"} ORDER BY display_order ASC, created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM mentors WHERE status = ${status}::"MentorStatus" AND name ILIKE ${"%" + search + "%"}`
  } else if (status) {
    rows      = await sql`SELECT id, slug, name, avatar, title, organization, status, is_published, is_featured, years_exp, created_at FROM mentors WHERE status = ${status}::"MentorStatus" ORDER BY display_order ASC, created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM mentors WHERE status = ${status}::"MentorStatus"`
  } else if (search) {
    rows      = await sql`SELECT id, slug, name, avatar, title, organization, status, is_published, is_featured, years_exp, created_at FROM mentors WHERE name ILIKE ${"%" + search + "%"} ORDER BY display_order ASC, created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM mentors WHERE name ILIKE ${"%" + search + "%"}`
  } else {
    rows      = await sql`SELECT id, slug, name, avatar, title, organization, status, is_published, is_featured, years_exp, created_at FROM mentors ORDER BY display_order ASC, created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM mentors`
  }

  return NextResponse.json({
    mentors:    rows,
    total:      Number(countRows[0]?.c ?? 0),
    totalPages: Math.ceil(Number(countRows[0]?.c ?? 0) / PAGE_SIZE),
    page,
  })
}

export async function POST(req) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const parsed = mentorSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const d = parsed.data

  const exist = await sql`SELECT id FROM mentors WHERE slug = ${d.slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })

  const expertiseTags = d.expertise
    ? d.expertise.split(",").map(s => s.trim()).filter(Boolean)
    : null

  try {
    const rows = await sql`
      INSERT INTO mentors
        (name, slug, title, organization, expertise, bio, short_bio,
         email, linkedin_url, facebook_url, website, years_exp, avatar,
         tags, status, is_published, is_featured, display_order)
      VALUES
        (${d.name}, ${d.slug}, ${d.title ?? ""}, ${d.organization ?? ""},
         ${expertiseTags},
         ${d.bio ?? ""}, ${d.shortBio ?? ""},
         ${d.email || null}, ${d.linkedinUrl || null}, ${d.facebookUrl || null},
         ${d.website || null}, ${d.yearsExp ?? null}, ${d.avatar || null},
         ${d.tags}, ${d.status}::"MentorStatus",
         ${d.isPublished}, ${d.isFeatured}, ${d.displayOrder})
      RETURNING id, slug
    `
    return NextResponse.json({ success: true, mentor: rows[0] }, { status: 201 })
  } catch (err) {
    logger.error("POST /api/admin/mentors failed", err)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}