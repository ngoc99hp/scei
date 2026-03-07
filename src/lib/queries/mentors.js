// src/lib/queries/mentors.js

import sql from "@/lib/db"

/**
 * Lấy danh sách mentor active đã publish
 * @param {{ featured?: boolean, limit?: number }} opts
 */
export async function getMentors({ featured, limit } = {}) {
  if (featured !== undefined && limit) {
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
  if (featured !== undefined) {
    return sql`
      SELECT id, slug, name, avatar, title, organization,
             expertise, short_bio, linkedin_url, email,
             years_exp, tags, is_featured, display_order
      FROM mentors
      WHERE is_published = true AND status = 'ACTIVE'
        AND is_featured = ${featured}
      ORDER BY display_order ASC
    `
  }
  return sql`
    SELECT id, slug, name, avatar, title, organization,
           expertise, short_bio, linkedin_url, email,
           years_exp, tags, is_featured, display_order
    FROM mentors
    WHERE is_published = true AND status = 'ACTIVE'
    ORDER BY is_featured DESC, display_order ASC
  `
}

/**
 * Lấy chi tiết 1 mentor theo slug
 * @param {string} slug
 */
export async function getMentorBySlug(slug) {
  const rows = await sql`
    SELECT * FROM mentors
    WHERE slug = ${slug} AND is_published = true
    LIMIT 1
  `
  return rows[0] ?? null
}

/**
 * Đếm tổng số mentor active (dùng cho stats)
 */
export async function getMentorCount() {
  const rows = await sql`
    SELECT COUNT(*) as count FROM mentors
    WHERE is_published = true AND status = 'ACTIVE'
  `
  return Number(rows[0]?.count ?? 0)
}