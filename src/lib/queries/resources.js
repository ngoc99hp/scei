// src/lib/queries/resources.js
//
// ✅ FIX Critical #4 — Neon serverless KHÔNG hỗ trợ nested sql`` template interpolation.
//
//    TRƯỚC (BUG):
//      const catCond = category ? sql`AND category = ${category}` : sql``
//      return sql`SELECT ... WHERE is_published = true ${catCond} ...`
//      → Runtime error: Neon không thể xử lý sql fragment được interpolate vào sql khác
//
//    SAU (FIX):
//      Tách thành các query riêng biệt cho mỗi tổ hợp điều kiện.
//      Pattern này đã được dùng đúng ở getEvents() — áp dụng nhất quán ở đây.

import sql from "@/lib/db"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

/**
 * Lấy danh sách resources đã publish với pagination và filter theo type/category
 *
 * @param {{ limit?: number, category?: string, page?: number, pageSize?: number }} opts
 */
export async function getResources({ limit, category, page, pageSize = DEFAULT_PAGE_SIZE } = {}) {

  // ── limit + category ─────────────────────────────────────────────────────
  if (limit !== undefined && category) {
    return sql`
      SELECT id, slug, title, description, type, cover_image,
             category, tags, download_count, external_url, file_url, is_featured
      FROM resources
      WHERE is_published = true
        AND category = ${category}
      ORDER BY is_featured DESC, created_at DESC
      LIMIT ${limit}
    `
  }

  // ── limit only (no category filter) ─────────────────────────────────────
  if (limit !== undefined) {
    return sql`
      SELECT id, slug, title, description, type, cover_image,
             category, tags, download_count, external_url, file_url, is_featured
      FROM resources
      WHERE is_published = true
      ORDER BY is_featured DESC, created_at DESC
      LIMIT ${limit}
    `
  }

  // ── Paginated + category filter ──────────────────────────────────────────
  const offset = ((page ?? 1) - 1) * pageSize

  if (category) {
    return sql`
      SELECT id, slug, title, description, type, cover_image,
             category, tags, download_count, external_url, file_url, is_featured
      FROM resources
      WHERE is_published = true
        AND category = ${category}
      ORDER BY is_featured DESC, created_at DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `
  }

  // ── Paginated, no filter ─────────────────────────────────────────────────
  return sql`
    SELECT id, slug, title, description, type, cover_image,
           category, tags, download_count, external_url, file_url, is_featured
    FROM resources
    WHERE is_published = true
    ORDER BY is_featured DESC, created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `
}

/**
 * Đếm tổng số resources published (dùng cho pagination)
 *
 * @param {{ category?: string }} opts
 */
export async function getResourceCount({ category } = {}) {
  // ✅ FIX — tách 2 query thay vì nested sql fragment
  if (category) {
    const rows = await sql`
      SELECT COUNT(*) as count
      FROM resources
      WHERE is_published = true
        AND category = ${category}
    `
    return Number(rows[0]?.count ?? 0)
  }

  const rows = await sql`
    SELECT COUNT(*) as count
    FROM resources
    WHERE is_published = true
  `
  return Number(rows[0]?.count ?? 0)
}

/**
 * Lấy chi tiết 1 resource theo slug + tăng download_count
 *
 * @param {string} slug
 */
export async function getResourceBySlug(slug) {
  const rows = await sql`
    SELECT *
    FROM resources
    WHERE slug = ${slug}
      AND is_published = true
    LIMIT 1
  `
  const resource = rows[0] ?? null

  // Tăng download_count bất đồng bộ (không block render)
  if (resource) {
    sql`
      UPDATE resources
      SET download_count = download_count + 1
      WHERE id = ${resource.id}
    `.catch(() => {})
  }

  return resource
}

/**
 * Lấy các resources liên quan (cùng category, trừ resource hiện tại)
 *
 * @param {string} resourceId
 * @param {string} category
 * @param {number} limit
 */
export async function getRelatedResources(resourceId, category, limit = 4) {
  return sql`
    SELECT id, slug, title, description, type, cover_image, download_count
    FROM resources
    WHERE is_published = true
      AND category = ${category}
      AND id != ${resourceId}
    ORDER BY is_featured DESC, created_at DESC
    LIMIT ${limit}
  `
}