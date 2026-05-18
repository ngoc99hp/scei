// src/app/api/admin/startups/[id]/route.js
import { NextResponse }              from "next/server"
import sql                           from "@/lib/db"
import { requireApiAdmin }           from "@/lib/auth"
import { startupSchema }             from "@/lib/validations"
import { logger }                    from "@/lib/logger"
import { deleteImage, extractPublicId } from "@/lib/cloudinary"
import { invalidateStartupStatsCache } from "@/lib/queries/startups"

export async function GET(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  const rows = await sql`SELECT * FROM startups WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ startup: rows[0] })
}

export async function PATCH(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
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

  const current   = await sql`SELECT cover_image, logo FROM startups WHERE id = ${id} LIMIT 1`
  const oldCover  = current[0]?.cover_image ?? null
  const oldLogo   = current[0]?.logo        ?? null

  try {
    await sql`
      UPDATE startups SET
        name             = ${d.name},
        slug             = ${d.slug},
        tagline          = ${d.tagline         ?? ""},
        description      = ${d.description     ?? ""},
        website          = ${d.website         || null},
        industry         = ${d.industry        ?? ""},
        stage            = ${d.stage}::"StartupStage",
        status           = ${d.status}::"StartupStatus",
        founded_year     = ${d.foundedYear     ?? null},
        team_size        = ${d.teamSize        ?? null},
        funding_raised   = ${d.fundingRaised   ?? null},
        cover_image      = ${d.coverImage      ?? null},
        logo             = ${d.logo            ?? null},
        founder_name     = ${d.founderName     ?? null},
        founder_email    = ${d.founderEmail    ?? null},
        founder_linkedin = ${d.founderLinkedin ?? null},
        linkedin_url     = ${d.linkedinUrl     ?? null},
        facebook_url     = ${d.facebookUrl     ?? null},
        tags             = ${d.tags},
        is_published     = ${d.isPublished},
        is_featured      = ${d.isFeatured},
        display_order    = ${d.displayOrder},
        updated_at       = now()
      WHERE id = ${id}
    `

    // Xóa ảnh cũ nếu bị thay
    if (oldCover && oldCover !== d.coverImage) {
      const pid = extractPublicId(oldCover)
      if (pid) deleteImage(pid).catch(() => {})
    }
    if (oldLogo && oldLogo !== d.logo) {
      const pid = extractPublicId(oldLogo)
      if (pid) deleteImage(pid).catch(() => {})
    }

    invalidateStartupStatsCache().catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error("PATCH /api/admin/startups/[id] failed", err, { id })
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params

  const current  = await sql`SELECT cover_image, logo FROM startups WHERE id = ${id} LIMIT 1`
  const coverImage = current[0]?.cover_image ?? null
  const logo       = current[0]?.logo        ?? null

  await sql`DELETE FROM startups WHERE id = ${id}`

  // Xóa cả cover_image và logo
  for (const url of [coverImage, logo]) {
    if (url) {
      const pid = extractPublicId(url)
      if (pid) deleteImage(pid).catch(() => {})
    }
  }

  invalidateStartupStatsCache().catch(() => {})

  return NextResponse.json({ success: true })
}