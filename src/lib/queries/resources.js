// src/lib/queries/resources.js

import sql from "@/lib/db"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

export async function getResources({ limit, category, page, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  if (limit !== undefined) {
    const catCond = category ? sql`AND category = ${category}` : sql``
    return sql`
      SELECT id, slug, title, description, type, cover_image,
             category, tags, download_count, external_url, file_url, is_featured
      FROM resources
      WHERE is_published = true ${catCond}
      ORDER BY is_featured DESC, created_at DESC
      LIMIT ${limit}
    `
  }
  const catCond = category ? sql`AND category = ${category}` : sql``
  const offset = ((page ?? 1) - 1) * pageSize
  return sql`
    SELECT id, slug, title, description, type, cover_image,
           category, tags, download_count, external_url, file_url, is_featured
    FROM resources
    WHERE is_published = true ${catCond}
    ORDER BY is_featured DESC, created_at DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `
}

export async function getResourceCount({ category } = {}) {
  if (category) {
    const rows = await sql`
      SELECT COUNT(*) as count FROM resources
      WHERE is_published = true AND category = ${category}
    `
    return Number(rows[0]?.count ?? 0)
  }
  const rows = await sql`
    SELECT COUNT(*) as count FROM resources WHERE is_published = true
  `
  return Number(rows[0]?.count ?? 0)
}

export async function getResourceBySlug(slug) {
  const rows = await sql`
    SELECT * FROM resources
    WHERE slug = ${slug} AND is_published = true
    LIMIT 1
  `
  const resource = rows[0] ?? null

  // Tăng download_count bất đồng bộ
  if (resource) {
    sql`
      UPDATE resources SET download_count = download_count + 1
      WHERE id = ${resource.id}
    `.catch(() => {})
  }

  return resource
}

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