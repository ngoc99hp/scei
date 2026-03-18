// src/lib/queries/articles.js

import sql from "@/lib/db"

/**
 * Lấy danh sách bài viết đã publish
 * @param {{ limit?: number, offset?: number, category?: string }} opts
 */
export async function getArticles({ limit, offset = 0, category } = {}) {
  const categoryFilter = category && category !== "all" ? category : null

  return sql`
    SELECT id, slug, title, excerpt, cover_image,
           category, tags, published_at, view_count
    FROM articles
    WHERE status = 'PUBLISHED'
      AND (${categoryFilter}::text IS NULL OR category = ${categoryFilter})
    ORDER BY published_at DESC
    LIMIT ${limit ?? 100} OFFSET ${offset}
  `
}

/**
 * Đếm tổng số bài viết đã publish (dùng cho pagination)
 * @param {{ category?: string }} opts
 */
export async function getArticleCount({ category } = {}) {
  const categoryFilter = category && category !== "all" ? category : null

  const rows = await sql`
    SELECT COUNT(*) as count FROM articles
    WHERE status = 'PUBLISHED'
      AND (${categoryFilter}::text IS NULL OR category = ${categoryFilter})
  `
  return Number(rows[0]?.count ?? 0)
}

/**
 * Lấy chi tiết 1 bài viết theo slug + tăng view_count
 * @param {string} slug
 */
export async function getArticleBySlug(slug) {
  const rows = await sql`
    SELECT * FROM articles
    WHERE slug = ${slug} AND status = 'PUBLISHED'
    LIMIT 1
  `
  const article = rows[0] ?? null

  // Tăng view count bất đồng bộ (không block render)
  if (article) {
    sql`
      UPDATE articles SET view_count = view_count + 1
      WHERE id = ${article.id}
    `.catch(() => {})
  }

  return article
}

/**
 * Lấy các bài liên quan (cùng category, trừ bài hiện tại)
 * @param {string} articleId
 * @param {string} category
 * @param {number} limit
 */
export async function getRelatedArticles(articleId, category, limit = 3) {
  return sql`
    SELECT id, slug, title, excerpt, cover_image, published_at
    FROM articles
    WHERE status = 'PUBLISHED'
      AND category = ${category}
      AND id != ${articleId}
    ORDER BY published_at DESC
    LIMIT ${limit}
  `
}