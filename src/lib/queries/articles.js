// src/lib/queries/articles.js

import sql from "@/lib/db"

/**
 * Lấy danh sách bài viết đã publish
 * @param {{ limit?: number, category?: string }} opts
 */
export async function getArticles({ limit, category } = {}) {
  if (category && limit) {
    return sql`
      SELECT id, slug, title, excerpt, cover_image,
             category, tags, published_at, view_count
      FROM articles
      WHERE status = 'PUBLISHED' AND category = ${category}
      ORDER BY published_at DESC
      LIMIT ${limit}
    `
  }
  if (limit) {
    return sql`
      SELECT id, slug, title, excerpt, cover_image,
             category, tags, published_at, view_count
      FROM articles
      WHERE status = 'PUBLISHED'
      ORDER BY published_at DESC
      LIMIT ${limit}
    `
  }
  return sql`
    SELECT id, slug, title, excerpt, cover_image,
           category, tags, published_at, view_count
    FROM articles
    WHERE status = 'PUBLISHED'
    ORDER BY published_at DESC
  `
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
    `.catch(() => {}) // Bỏ qua lỗi, không quan trọng
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