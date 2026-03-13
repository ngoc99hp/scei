// src/lib/queries/mentors.js

import sql from "@/lib/db"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

/**
 * Lấy danh sách mentor active đã publish với pagination
 */
export async function getMentors({ featured, limit, page, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  if (limit !== undefined && featured !== undefined) {
    return sql`
      SELECT id, slug, name, avatar, title, organization,
             expertise, short_bio, linkedin_url, email,
             years_exp, tags, is_featured, display_order
      FROM mentors
      WHERE is_published = true AND status = 'ACTIVE'
        AND is_featured = ${featured}
      ORDER BY display_order ASC
      LIMIT ${limit}
    `
  }
  if (limit !== undefined) {
    return sql`
      SELECT id, slug, name, avatar, title, organization,
             expertise, short_bio, linkedin_url, email,
             years_exp, tags, is_featured, display_order
      FROM mentors
      WHERE is_published = true AND status = 'ACTIVE'
      ORDER BY is_featured DESC, display_order ASC
      LIMIT ${limit}
    `
  }
  const offset = ((page ?? 1) - 1) * pageSize
  return sql`
    SELECT id, slug, name, avatar, title, organization,
           expertise, short_bio, linkedin_url, email,
           years_exp, tags, is_featured, display_order
    FROM mentors
    WHERE is_published = true AND status = 'ACTIVE'
    ORDER BY is_featured DESC, display_order ASC
    LIMIT ${pageSize} OFFSET ${offset}
  `
}

/**
 * Đếm tổng mentor (dùng cho pagination + stats)
 */
export async function getMentorCount() {
  const rows = await sql`
    SELECT COUNT(*) as count FROM mentors
    WHERE is_published = true AND status = 'ACTIVE'
  `
  return Number(rows[0]?.count ?? 0)
}

/**
 * Lấy chi tiết 1 mentor theo slug
 */
export async function getMentorBySlug(slug) {
  const rows = await sql`
    SELECT * FROM mentors
    WHERE slug = ${slug} AND is_published = true
    LIMIT 1
  `
  return rows[0] ?? null
}