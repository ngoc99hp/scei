// src/lib/queries/events.js

import sql from "@/lib/db"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

/**
 * Lấy danh sách sự kiện đã publish với pagination
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

  // ── limit + featured filter (dùng cho section widget) ────────────────────
  if (limit !== undefined) {
    if (featured !== undefined) {
      return sql`
        SELECT id, slug, title, type, status, short_desc, cover_image,
               start_date, end_date, is_online, location,
               max_attendees, registered_count, tags, is_featured
        FROM events
        WHERE is_published = true
          AND is_featured = ${featured}
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
      ORDER BY start_date ASC
      LIMIT ${limit}
    `
  }

  // ── Paginated full list (dùng cho /events page) ───────────────────────────
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
 * Đăng ký tham dự sự kiện – ATOMIC transaction với SELECT FOR UPDATE.
 *
 * Thay thế pattern cũ (INSERT riêng + incrementEventRegistration riêng)
 * để tránh race condition gây overbooking khi concurrent requests.
 *
 * Trả về object { success, message, error, status } thay vì throw,
 * để route handler dễ map sang HTTP response.
 *
 * @param {string} eventId
 * @param {{ name: string, email: string, phone?: string, organization?: string, note?: string }} data
 * @returns {Promise<{ success: boolean, message?: string, error?: string, httpStatus: number }>}
 */
export async function registerForEvent(eventId, { name, email, phone, organization, note }) {
  // Neon serverless hỗ trợ interactive transactions qua sql.begin()
  // Docs: https://neon.tech/docs/serverless/serverless-driver#transaction
  return await sql.begin(async (tx) => {

    // 1. Lock row để tránh concurrent overbooking
    const events = await tx`
      SELECT id, title, status, max_attendees, registered_count, register_deadline
      FROM events
      WHERE id = ${eventId}
        AND is_published = true
      LIMIT 1
      FOR UPDATE
    `

    if (events.length === 0) {
      return { success: false, error: "Sự kiện không tồn tại.", httpStatus: 404 }
    }

    const event = events[0]

    // 2. FIX: Chỉ cho phép đăng ký khi status = OPEN
    //    (Trước đây sai: cho phép cả DRAFT)
    if (event.status !== "OPEN") {
      return {
        success: false,
        error: "Sự kiện hiện không nhận đăng ký.",
        httpStatus: 400,
      }
    }

    // 3. Kiểm tra deadline
    if (event.register_deadline && new Date(event.register_deadline) < new Date()) {
      return {
        success: false,
        error: "Đã hết hạn đăng ký sự kiện này.",
        httpStatus: 400,
      }
    }

    // 4. Kiểm tra còn chỗ (đọc từ locked row – không bị stale)
    if (event.max_attendees && event.registered_count >= event.max_attendees) {
      return {
        success: false,
        error: "Sự kiện đã đủ số lượng người tham dự.",
        httpStatus: 400,
      }
    }

    // 5. Kiểm tra duplicate email trong cùng transaction
    const existing = await tx`
      SELECT id FROM event_registrations
      WHERE event_id = ${eventId}
        AND email = ${email}
      LIMIT 1
    `
    if (existing.length > 0) {
      return {
        success: false,
        error: "Email này đã đăng ký sự kiện trước đó.",
        httpStatus: 409,
      }
    }

    // 6. Insert registration
    await tx`
      INSERT INTO event_registrations
        (event_id, name, email, phone, organization, note, status)
      VALUES
        (${eventId}, ${name}, ${email}, ${phone ?? null}, ${organization ?? null}, ${note ?? null}, 'REGISTERED')
    `

    // 7. Tăng counter trong cùng transaction (atomic)
    await tx`
      UPDATE events
      SET registered_count = registered_count + 1
      WHERE id = ${eventId}
    `

    return {
      success: true,
      message: `Đăng ký thành công! Chúng tôi sẽ gửi thông tin chi tiết đến ${email}.`,
      httpStatus: 201,
    }
  })
}

/**
 * @deprecated Dùng registerForEvent() thay thế để đảm bảo atomicity.
 * Giữ lại để không break code khác đang gọi trực tiếp (nếu có).
 */
export async function incrementEventRegistration(eventId) {
  await sql`
    UPDATE events
    SET registered_count = COALESCE(registered_count, 0) + 1
    WHERE id = ${eventId}
  `
}