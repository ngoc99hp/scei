// src/lib/queries/programs.js

import sql from "@/lib/db"

/**
 * Lấy danh sách chương trình đã publish
 * @param {{ featured?: boolean, limit?: number }} opts
 */
export async function getPrograms({ featured, limit } = {}) {
  if (featured !== undefined && limit) {
    return sql`
      SELECT id, slug, name, type, status, short_desc,
             benefits, max_applicants, apply_deadline,
             cover_image, is_featured, display_order
      FROM programs
      WHERE is_published = true AND is_featured = ${featured}
      ORDER BY display_order ASC
      LIMIT ${limit}
    `
  }
  if (featured !== undefined) {
    return sql`
      SELECT id, slug, name, type, status, short_desc,
             benefits, max_applicants, apply_deadline,
             cover_image, is_featured, display_order
      FROM programs
      WHERE is_published = true AND is_featured = ${featured}
      ORDER BY display_order ASC
    `
  }
  return sql`
    SELECT id, slug, name, type, status, short_desc,
           benefits, max_applicants, apply_deadline,
           cover_image, is_featured, display_order
    FROM programs
    WHERE is_published = true
    ORDER BY is_featured DESC, display_order ASC
  `
}

/**
 * Lấy chi tiết 1 chương trình theo slug
 * @param {string} slug
 */
export async function getProgramBySlug(slug) {
  const rows = await sql`
    SELECT * FROM programs
    WHERE slug = ${slug} AND is_published = true
    LIMIT 1
  `
  return rows[0] ?? null
}

/**
 * Đếm số đơn đăng ký của 1 chương trình
 * @param {string} programId
 */
export async function getProgramApplicationCount(programId) {
  const rows = await sql`
    SELECT COUNT(*) as count FROM applications
    WHERE program_id = ${programId}
  `
  return Number(rows[0]?.count ?? 0)
}