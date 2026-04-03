// src/lib/queries/articles.js

import sql    from "@/lib/db"
import { logger } from "@/lib/logger"

/**
 * Lấy danh sách bài viết đã publish
 * @param {{ limit?: number, offset?: number, category?: string }} opts
 */
export async function getArticles({ limit, offset = 0, category } = {}) {
  if (category && limit !== undefined) {
    return sql`
      SELECT id, slug, title, excerpt, cover_image,
             category, tags, published_at, view_count
      FROM articles
      WHERE status = 'PUBLISHED' AND category = ${category}
      ORDER BY published_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  }
  if (category) {
    return sql`
      SELECT id, slug, title, excerpt, cover_image,
             category, tags, published_at, view_count
      FROM articles
      WHERE status = 'PUBLISHED' AND category = ${category}
      ORDER BY published_at DESC
      OFFSET ${offset}
    `
  }
  if (limit !== undefined) {
    return sql`
      SELECT id, slug, title, excerpt, cover_image,
             category, tags, published_at, view_count
      FROM articles
      WHERE status = 'PUBLISHED'
      ORDER BY published_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `
  }
  return sql`
    SELECT id, slug, title, excerpt, cover_image,
           category, tags, published_at, view_count
    FROM articles
    WHERE status = 'PUBLISHED'
    ORDER BY published_at DESC
    OFFSET ${offset}
  `
}

/**
 * Đếm tổng số bài viết đã publish (dùng cho pagination)
 * @param {{ category?: string }} opts
 */
export async function getArticleCount({ category } = {}) {
  if (category) {
    const rows = await sql`
      SELECT COUNT(*) as count FROM articles
      WHERE status = 'PUBLISHED' AND category = ${category}
    `
    return Number(rows[0]?.count ?? 0)
  }
  const rows = await sql`
    SELECT COUNT(*) as count FROM articles
    WHERE status = 'PUBLISHED'
  `
  return Number(rows[0]?.count ?? 0)
}

// ── Bot detection ─────────────────────────────────────────────
//
// Danh sách bot/crawler User-Agent patterns phổ biến.
// Không cần exhaustive — chặn được Googlebot, các major crawlers là đủ.
// Các UA không khớp vẫn có thể là bot, nhưng sẽ không làm skew số liệu nhiều.
const BOT_UA_PATTERN = /bot|crawler|spider|crawling|facebookexternalhit|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|discordbot|applebot|bingbot|yandex|baidu|duckduck|semrush|ahrefs|moz|dataprovider|bytespider|gptbot|claudebot|anthropic/i

/**
 * Kiểm tra User-Agent có phải bot không.
 * @param {string|null} ua
 * @returns {boolean}
 */
export function isBotUserAgent(ua) {
  if (!ua || ua.trim() === "") return true   // không có UA → coi là bot
  return BOT_UA_PATTERN.test(ua)
}

/**
 * Lấy chi tiết 1 bài viết theo slug.
 * Tăng view_count bất đồng bộ, với bot filter để tránh inflate số liệu.
 *
 * @param {string} slug
 * @param {string|null} [userAgent] - request UA để filter bot
 */
export async function getArticleBySlug(slug, userAgent = null) {
  const rows = await sql`
    SELECT * FROM articles
    WHERE slug = ${slug} AND status = 'PUBLISHED'
    LIMIT 1
  `
  const article = rows[0] ?? null

  // Tăng view count bất đồng bộ (không block render)
  // Chỉ đếm nếu không phải bot
  if (article) {
    const isBot = isBotUserAgent(userAgent)
    if (!isBot) {
      sql`
        UPDATE articles SET view_count = view_count + 1
        WHERE id = ${article.id}
      `.catch((err) => logger.warn("view_count increment failed", err, { slug }))
    } else {
      logger.debug("view_count skipped: bot UA", { slug, ua: userAgent?.slice(0, 80) })
    }
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