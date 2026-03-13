// src/lib/queries/programs.js

import sql from "@/lib/db"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

/**
 * Lấy danh sách chương trình đã publish với pagination
 * @param {{ featured?: boolean, limit?: number, page?: number, pageSize?: number }} opts
 */
export async function getPrograms({ featured, limit, page, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  // Simple limit (dùng cho homepage widgets)
  if (limit !== undefined && featured !== undefined) {
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
  if (limit !== undefined) {
    return sql`
      SELECT id, slug, name, type, status, short_desc,
             benefits, max_applicants, apply_deadline,
             cover_image, is_featured, display_order
      FROM programs
      WHERE is_published = true
      ORDER BY is_featured DESC, display_order ASC
      LIMIT ${limit}
    `
  }

  // Paginated list
  const offset = ((page ?? 1) - 1) * pageSize
  return sql`
    SELECT id, slug, name, type, status, short_desc,
           benefits, max_applicants, apply_deadline,
           cover_image, is_featured, display_order
    FROM programs
    WHERE is_published = true
    ORDER BY is_featured DESC, display_order ASC
    LIMIT ${pageSize} OFFSET ${offset}
  `
}

/**
 * Đếm tổng số programs published (dùng cho pagination)
 */
export async function getProgramCount({ featured } = {}) {
  if (featured !== undefined) {
    const rows = await sql`
      SELECT COUNT(*) as count FROM programs
      WHERE is_published = true AND is_featured = ${featured}
    `
    return Number(rows[0]?.count ?? 0)
  }
  const rows = await sql`
    SELECT COUNT(*) as count FROM programs WHERE is_published = true
  `
  return Number(rows[0]?.count ?? 0)
}

/**
 * Lấy chi tiết 1 chương trình theo slug
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
 */
export async function getProgramApplicationCount(programId) {
  const rows = await sql`
    SELECT COUNT(*) as count FROM applications
    WHERE program_id = ${programId}
  `
  return Number(rows[0]?.count ?? 0)
}