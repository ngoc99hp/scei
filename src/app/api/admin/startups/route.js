// src/app/api/admin/startups/route.js
import { NextResponse }    from "next/server"
import sql                 from "@/lib/db"
import { requireApiAdmin } from "@/lib/auth"
import { startupSchema }   from "@/lib/validations"
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
    rows      = await sql`SELECT id, slug, name, logo, stage, status, industry, is_published, is_featured, founded_year, created_at FROM startups WHERE status = ${status}::"StartupStatus" AND name ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM startups WHERE status = ${status}::"StartupStatus" AND name ILIKE ${"%" + search + "%"}`
  } else if (status) {
    rows      = await sql`SELECT id, slug, name, logo, stage, status, industry, is_published, is_featured, founded_year, created_at FROM startups WHERE status = ${status}::"StartupStatus" ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM startups WHERE status = ${status}::"StartupStatus"`
  } else if (search) {
    rows      = await sql`SELECT id, slug, name, logo, stage, status, industry, is_published, is_featured, founded_year, created_at FROM startups WHERE name ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM startups WHERE name ILIKE ${"%" + search + "%"}`
  } else {
    rows      = await sql`SELECT id, slug, name, logo, stage, status, industry, is_published, is_featured, founded_year, created_at FROM startups ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM startups`
  }

  return NextResponse.json({
    startups:   rows,
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

  const parsed = startupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const d = parsed.data

  const exist = await sql`SELECT id FROM startups WHERE slug = ${d.slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })

  try {
    const rows = await sql`
      INSERT INTO startups
        (name, slug, tagline, description, website, industry, stage, status,
         founded_year, team_size, funding_raised, cover_image, logo,
         founder_name, founder_email, founder_linkedin,
         linkedin_url, facebook_url, tags, is_published, is_featured, display_order)
      VALUES
        (${d.name}, ${d.slug}, ${d.tagline || null}, ${d.description || null},
         ${d.website || null}, ${d.industry || null},
         ${d.stage}::"StartupStage", ${d.status}::"StartupStatus",
         ${d.foundedYear    ?? null}, ${d.teamSize       ?? null},
         ${d.fundingRaised  ?? null}, ${d.coverImage     || null},
         ${d.logo           || null}, ${d.founderName    || null},
         ${d.founderEmail   || null}, ${d.founderLinkedin || null},
         ${d.linkedinUrl    || null}, ${d.facebookUrl    || null},
         ${d.tags}, ${d.isPublished}, ${d.isFeatured}, ${d.displayOrder})
      RETURNING id, slug
    `
    return NextResponse.json({ success: true, startup: rows[0] }, { status: 201 })
  } catch (err) {
    logger.error("POST /api/admin/startups failed", err)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}