// src/lib/queries/startups.js

import sql from "@/lib/db"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

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
 * Tính tổng vốn và nhân sự (dùng cho stats)
 */
export async function getStartupStats() {
  const rows = await sql`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(funding_raised), 0) as total_funding,
      COALESCE(SUM(team_size), 0) as total_team
    FROM startups
    WHERE is_published = true
  `
  const r = rows[0]
  return {
    total:        Number(r.total),
    totalFunding: Number(r.total_funding),
    totalTeam:    Number(r.total_team),
  }
}