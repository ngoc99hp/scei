// src/lib/queries/startups.js

import sql                from "@/lib/db"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { logger }         from "@/lib/logger"

// ── Redis cache helper ────────────────────────────────────────
// Lazy-init: chỉ tạo client khi thực sự cần, tránh lỗi khi build
let _redis = null

async function getRedis() {
  if (_redis) return _redis
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  const { Redis } = await import("@upstash/redis")
  _redis = new Redis({
    url:   process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  return _redis
}

const STATS_CACHE_KEY = "startup_stats"
const STATS_TTL_SEC   = 3600 // 1 giờ — số liệu aggregate không cần realtime

/**
 * Lấy danh sách startup đã publish với pagination
 */
export async function getStartups({ featured, limit, status, page, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  if (limit !== undefined && featured !== undefined) {
    return sql`
      SELECT id, slug, name, logo, tagline, industry,
             stage, status, funding_raised, team_size,
             cover_image, tags, is_featured, display_order
      FROM startups
      WHERE is_published = true AND is_featured = ${featured}
      ORDER BY display_order ASC
      LIMIT ${limit}
    `
  }
  if (status) {
    const offset = ((page ?? 1) - 1) * pageSize
    return sql`
      SELECT id, slug, name, logo, tagline, industry,
             stage, status, funding_raised, team_size,
             cover_image, tags, is_featured, display_order
      FROM startups
      WHERE is_published = true AND status = ${status}
      ORDER BY is_featured DESC, display_order ASC
      LIMIT ${pageSize} OFFSET ${offset}
    `
  }
  if (limit !== undefined) {
    return sql`
      SELECT id, slug, name, logo, tagline, industry,
             stage, status, funding_raised, team_size,
             cover_image, tags, is_featured, display_order
      FROM startups
      WHERE is_published = true
      ORDER BY is_featured DESC, display_order ASC
      LIMIT ${limit}
    `
  }
  const offset = ((page ?? 1) - 1) * pageSize
  return sql`
    SELECT id, slug, name, logo, tagline, industry,
           stage, status, funding_raised, team_size,
           cover_image, tags, is_featured, display_order
    FROM startups
    WHERE is_published = true
    ORDER BY is_featured DESC, display_order ASC
    LIMIT ${pageSize} OFFSET ${offset}
  `
}

/**
 * Đếm tổng số startups (dùng cho pagination)
 */
export async function getStartupCount({ status } = {}) {
  if (status) {
    const rows = await sql`
      SELECT COUNT(*) as count FROM startups
      WHERE is_published = true AND status = ${status}
    `
    return Number(rows[0]?.count ?? 0)
  }
  const rows = await sql`
    SELECT COUNT(*) as count FROM startups WHERE is_published = true
  `
  return Number(rows[0]?.count ?? 0)
}

/**
 * Lấy chi tiết 1 startup theo slug
 */
export async function getStartupBySlug(slug) {
  const rows = await sql`
    SELECT * FROM startups
    WHERE slug = ${slug} AND is_published = true
    LIMIT 1
  `
  return rows[0] ?? null
}

/**
 * Tính tổng vốn và nhân sự (dùng cho stats section trang chủ + trang startups).
 *
 * Cache strategy: Redis với TTL 1 giờ.
 * - Cache hit  → trả về ngay, không query DB
 * - Cache miss → query DB, write-through vào Redis
 * - Redis lỗi  → fallback query DB trực tiếp, không throw
 *
 * Invalidation: gọi invalidateStartupStatsCache() sau khi create/update/delete startup
 * trong admin routes.
 */
export async function getStartupStats() {
  const redis = await getRedis()

  // 1. Thử đọc từ cache
  if (redis) {
    try {
      const cached = await redis.get(STATS_CACHE_KEY)
      if (cached) {
        logger.debug("getStartupStats: cache hit")
        // Redis trả về object đã parse nếu dùng JSON, hoặc string nếu SET thuần
        return typeof cached === "string" ? JSON.parse(cached) : cached
      }
    } catch (err) {
      // Cache lỗi → tiếp tục query DB, không crash
      logger.warn("getStartupStats: Redis read error, falling back to DB", err)
    }
  }

  // 2. Query DB
  logger.debug("getStartupStats: cache miss, querying DB")
  const rows = await sql`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(funding_raised), 0) as total_funding,
      COALESCE(SUM(team_size), 0) as total_team
    FROM startups
    WHERE is_published = true
  `
  const r = rows[0]
  const stats = {
    total:        Number(r.total),
    totalFunding: Number(r.total_funding),
    totalTeam:    Number(r.total_team),
  }

  // 3. Write-through: lưu vào cache
  if (redis) {
    try {
      await redis.set(STATS_CACHE_KEY, JSON.stringify(stats), { ex: STATS_TTL_SEC })
      logger.debug("getStartupStats: cached", { ttl: STATS_TTL_SEC })
    } catch (err) {
      // Cache write lỗi không nghiêm trọng — vẫn trả dữ liệu đúng
      logger.warn("getStartupStats: Redis write error", err)
    }
  }

  return stats
}

/**
 * Xóa cache startup stats — gọi sau khi tạo/sửa/xóa startup trong admin.
 *
 * Fire-and-forget: hàm này không throw, mọi lỗi đều được log.
 * Admin routes có thể gọi mà không cần await nếu không muốn block response.
 */
export async function invalidateStartupStatsCache() {
  const redis = await getRedis()
  if (!redis) return

  try {
    await redis.del(STATS_CACHE_KEY)
    logger.info("invalidateStartupStatsCache: cleared")
  } catch (err) {
    logger.warn("invalidateStartupStatsCache: Redis error", err)
  }
}