// src/lib/queries/events.js

import sql from "@/lib/db"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

/**
 * Lấy danh sách sự kiện đã publish với pagination
 * @param {{
 *   featured?: boolean,
 *   limit?: number,
 *   upcomingOnly?: boolean,
 *   page?: number,
 *   pageSize?: number
 * }} opts
 */
export async function getEvents({
  featured,
  limit,
  upcomingOnly,
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  type,
  q,
} = {}) {
  const typeFilter = type && type !== "all" ? type : null
  const searchFilter = q ? `%${q}%` : null
  const isFeaturedFilter = featured !== undefined ? featured : null

  // ── upcomingOnly + limit (dùng cho homepage widget) ──────────────────────
  if (upcomingOnly && limit) {
    return sql`
      SELECT id, slug, title, type, status, short_desc, cover_image,
             start_date, end_date, is_online, location,
             max_attendees, registered_count, tags, is_featured
      FROM events
      WHERE is_published = true
        AND status IN ('OPEN', 'ONGOING')
        AND start_date >= NOW()
      ORDER BY start_date ASC
      LIMIT ${limit}
    `
  }

  // ── Paginated or Limited list with filters ───────────────────────────────
  const offset = ((page ?? 1) - 1) * pageSize

  return sql`
    SELECT id, slug, title, type, status, short_desc, cover_image,
           start_date, end_date, is_online, location,
           max_attendees, registered_count, tags, is_featured
    FROM events
    WHERE is_published = true
      AND (${typeFilter}::text IS NULL OR type = ${typeFilter})
      AND (${searchFilter}::text IS NULL OR title ILIKE ${searchFilter} OR short_desc ILIKE ${searchFilter})
      AND (${isFeaturedFilter}::boolean IS NULL OR is_featured = ${isFeaturedFilter})
    ORDER BY is_featured DESC, start_date ASC
    LIMIT ${limit ?? pageSize} OFFSET ${offset}
  `
}

/**
 * Đếm tổng events đã publish (dùng cho pagination)
 */
export async function getEventCount({ type, q } = {}) {
  const typeFilter = type && type !== "all" ? type : null
  const searchFilter = q ? `%${q}%` : null

  const rows = await sql`
    SELECT COUNT(*) as count
    FROM events
    WHERE is_published = true
      AND (${typeFilter}::text IS NULL OR type = ${typeFilter})
      AND (${searchFilter}::text IS NULL OR title ILIKE ${searchFilter} OR short_desc ILIKE ${searchFilter})
  `
  return Number(rows[0]?.count ?? 0)
}

/**
 * Lấy chi tiết 1 sự kiện theo slug
 * @param {string} slug
 */
export async function getEventBySlug(slug) {
  const rows = await sql`
    SELECT * FROM events
    WHERE slug = ${slug}
      AND is_published = true
    LIMIT 1
  `
  return rows[0] ?? null
}

/**
 * Tăng registered_count sau khi có đăng ký mới
 * @param {string} eventId
 */
export async function incrementEventRegistration(eventId) {
  await sql`
    UPDATE events
    SET registered_count = COALESCE(registered_count, 0) + 1
    WHERE id = ${eventId}
  `
}