// src/app/api/admin/articles/[id]/route.js
// GET    /api/admin/articles/[id] — lấy full bài viết để edit
// PATCH  /api/admin/articles/[id] — cập nhật
// DELETE /api/admin/articles/[id] — xóa

import { NextResponse }    from "next/server"
import { getServerSession } from "next-auth"
import { authOptions }     from "@/lib/auth.config"
import sql                 from "@/lib/db"
import { sanitizeHtml }    from "@/lib/sanitize"

async function requireAdmin() {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role !== "ADMIN") return null
  return s
}

export async function GET(req, { params }) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const rows = await sql`SELECT * FROM articles WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 })
  return NextResponse.json({ article: rows[0] })
}

export async function PATCH(req, { params }) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const {
    title, slug, excerpt, content, cover_image,
    status, category, tags, meta_title, meta_desc,
  } = body

  if (!title?.trim()) return NextResponse.json({ error: "Tiêu đề là bắt buộc" }, { status: 422 })
  if (!slug?.trim())  return NextResponse.json({ error: "Slug là bắt buộc" }, { status: 422 })

  // Kiểm tra slug trùng với bài khác
  const exist = await sql`SELECT id FROM articles WHERE slug = ${slug} AND id != ${id} LIMIT 1`
  if (exist[0]) return NextResponse.json({ error: "Slug đã được dùng bởi bài viết khác" }, { status: 422 })

  const safeContent = content ? sanitizeHtml(content) : null

  // Cập nhật published_at khi chuyển sang PUBLISHED lần đầu
  const current = await sql`SELECT status, published_at FROM articles WHERE id = ${id} LIMIT 1`
  const wasPublished = current[0]?.status === "PUBLISHED"
  const nowPublished = status === "PUBLISHED"
  const publishedAt  = nowPublished && !wasPublished ? new Date() : (current[0]?.published_at ?? null)

  await sql`
    UPDATE articles SET
      title       = ${title.trim()},
      slug        = ${slug.trim()},
      excerpt     = ${excerpt     || null},
      content     = ${safeContent},
      cover_image = ${cover_image || null},
      status      = ${status}::"ArticleStatus",
      category    = ${category   || null},
      tags        = ${JSON.stringify(tags ?? [])},
      meta_title  = ${meta_title || null},
      meta_desc   = ${meta_desc  || null},
      published_at = ${publishedAt},
      updated_at  = now()
    WHERE id = ${id}
  `

  return NextResponse.json({ success: true })
}

export async function DELETE(req, { params }) {
  if (!await requireAdmin())
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await sql`DELETE FROM articles WHERE id = ${id}`
  return NextResponse.json({ success: true })
}