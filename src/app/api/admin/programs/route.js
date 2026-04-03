// src/app/api/admin/programs/route.js
import { NextResponse }    from "next/server"
import sql                 from "@/lib/db"
import { requireApiAdmin } from "@/lib/auth"
import { programSchema }   from "@/lib/validations"
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
    rows      = await sql`SELECT id, slug, name, type, status, is_published, is_featured, apply_deadline, max_applicants, created_at FROM programs WHERE status = ${status}::"ProgramStatus" AND name ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM programs WHERE status = ${status}::"ProgramStatus" AND name ILIKE ${"%" + search + "%"}`
  } else if (status) {
    rows      = await sql`SELECT id, slug, name, type, status, is_published, is_featured, apply_deadline, max_applicants, created_at FROM programs WHERE status = ${status}::"ProgramStatus" ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM programs WHERE status = ${status}::"ProgramStatus"`
  } else if (search) {
    rows      = await sql`SELECT id, slug, name, type, status, is_published, is_featured, apply_deadline, max_applicants, created_at FROM programs WHERE name ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM programs WHERE name ILIKE ${"%" + search + "%"}`
  } else {
    rows      = await sql`SELECT id, slug, name, type, status, is_published, is_featured, apply_deadline, max_applicants, created_at FROM programs ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM programs`
  }

  return NextResponse.json({
    programs: rows,
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

  // Zod validation
  const parsed = programSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const d = parsed.data

  const exist = await sql`SELECT id FROM programs WHERE slug = ${d.slug} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })

  try {
    const rows = await sql`
      INSERT INTO programs
        (name, slug, type, status, short_desc, description, content, benefits, requirements,
         cover_image, start_date, end_date, apply_deadline, max_applicants,
         is_published, is_featured, display_order)
      VALUES
        (${d.name}, ${d.slug}, ${d.type}::"ProgramType", ${d.status}::"ProgramStatus",
         ${d.shortDesc || null}, ${d.description || null}, ${d.content || null},
         ${d.benefits  || null}, ${d.requirements || null},
         ${d.coverImage    || null},
         ${d.startDate     || null}, ${d.endDate || null}, ${d.applyDeadline || null},
         ${d.maxApplicants ?? null},
         ${d.isPublished}, ${d.isFeatured}, ${d.displayOrder})
      RETURNING id, slug
    `
    return NextResponse.json({ success: true, program: rows[0] }, { status: 201 })
  } catch (err) {
    logger.error("POST /api/admin/programs failed", err)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}