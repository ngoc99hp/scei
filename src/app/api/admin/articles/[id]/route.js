// src/app/api/admin/articles/[id]/route.js
import { NextResponse }              from "next/server"
import sql                           from "@/lib/db"
import { sanitizeHtml }              from "@/lib/sanitize"
import { requireApiAdmin }           from "@/lib/auth"
import { articleSchema }             from "@/lib/validations"
import { logger }                    from "@/lib/logger"
import { deleteImage, extractPublicId } from "@/lib/cloudinary"

export async function GET(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  const rows = await sql`SELECT * FROM articles WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ article: rows[0] })
}

export async function PATCH(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params
  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const parsed = articleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const d = parsed.data

  const exist = await sql`SELECT id FROM articles WHERE slug = ${d.slug} AND id != ${id} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã được dùng bởi bài viết khác" }, { status: 422 })

  const current     = await sql`SELECT status, published_at, cover_image FROM articles WHERE id = ${id} LIMIT 1`
  const oldImage    = current[0]?.cover_image ?? null
  const nowPublished = d.status === "PUBLISHED"
  const wasPublished = current[0]?.status === "PUBLISHED"
  const publishedAt  = nowPublished && !wasPublished ? new Date() : (current[0]?.published_at ?? null)

  const safeContent = d.content ? sanitizeHtml(d.content) : null

  try {
    await sql`
      UPDATE articles SET
        title        = ${d.title},
        slug         = ${d.slug},
        excerpt      = ${d.excerpt     ?? null},
        content      = ${safeContent},
        cover_image  = ${d.coverImage  ?? null},
        status       = ${d.status}::"ArticleStatus",
        category     = ${d.category    ?? null},
        tags         = ${d.tags},
        meta_title   = ${d.metaTitle   ?? null},
        meta_desc    = ${d.metaDesc    ?? null},
        published_at = ${publishedAt},
        updated_at   = now()
      WHERE id = ${id}
    `

    if (oldImage && oldImage !== d.coverImage) {
      const pid = extractPublicId(oldImage)
      if (pid) deleteImage(pid).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error("PATCH /api/admin/articles/[id] failed", err, { id })
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { id } = await params

  const current    = await sql`SELECT cover_image FROM articles WHERE id = ${id} LIMIT 1`
  const coverImage = current[0]?.cover_image ?? null

  await sql`DELETE FROM articles WHERE id = ${id}`

  if (coverImage) {
    const pid = extractPublicId(coverImage)
    if (pid) deleteImage(pid).catch(() => {})
  }

  return NextResponse.json({ success: true })
}