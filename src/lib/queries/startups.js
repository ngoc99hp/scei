// src/lib/queries/startups.js

import sql from "@/lib/db"

/**
 * Lấy danh sách startup đã publish
 * @param {{ featured?: boolean, limit?: number, status?: string }} opts
 */
export async function getStartups({ featured, limit, status } = {}) {
  // Xây dựng điều kiện động bằng cách dùng nhiều query riêng
  // (neon tagged templates không hỗ trợ dynamic WHERE tốt)
  if (featured !== undefined && limit) {
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
    return sql`
      SELECT id, slug, name, logo, tagline, industry,
             stage, status, funding_raised, team_size,
             cover_image, tags, is_featured, display_order
      FROM startups
      WHERE is_published = true AND status = ${status}
      ORDER BY is_featured DESC, display_order ASC
    `
  }
  return sql`
    SELECT id, slug, name, logo, tagline, industry,
           stage, status, funding_raised, team_size,
           cover_image, tags, is_featured, display_order
    FROM startups
    WHERE is_published = true
    ORDER BY is_featured DESC, display_order ASC
  `
}

/**
 * Lấy chi tiết 1 startup theo slug
 * @param {string} slug
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
 * Tính tổng vốn huy động và nhân sự (dùng cho stats section)
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