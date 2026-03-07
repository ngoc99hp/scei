// src/lib/queries/events.js

import sql from "@/lib/db"

/**
 * Lấy danh sách sự kiện đã publish
 * @param {{ featured?: boolean, limit?: number, upcomingOnly?: boolean }} opts
 */
export async function getEvents({ featured, limit, upcomingOnly } = {}) {
  if (upcomingOnly && limit) {
    return sql`
      SELECT id, slug, title, type, status, short_desc, cover_image,
             start_date, end_date, is_online, location,
             max_attendees, registered_count, tags, is_featured
      FROM events
      WHERE is_published = true
        AND status IN ('OPEN', 'DRAFT')
        AND start_date >= NOW()
      ORDER BY start_date ASC
      LIMIT ${limit}
    `
  }
  if (featured !== undefined && limit) {
    return sql`
      SELECT id, slug, title, type, status, short_desc, cover_image,
             start_date, end_date, is_online, location,
             max_attendees, registered_count, tags, is_featured
      FROM events
      WHERE is_published = true AND is_featured = ${featured}
      ORDER BY start_date ASC
      LIMIT ${limit}
    `
  }
  return sql`
    SELECT id, slug, title, type, status, short_desc, cover_image,
           start_date, end_date, is_online, location,
           max_attendees, registered_count, tags, is_featured
    FROM events
    WHERE is_published = true
    ORDER BY is_featured DESC, start_date ASC
  `
}

/**
 * Lấy chi tiết 1 sự kiện theo slug
 * @param {string} slug
 */
export async function getEventBySlug(slug) {
  const rows = await sql`
    SELECT * FROM events
    WHERE slug = ${slug} AND is_published = true
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