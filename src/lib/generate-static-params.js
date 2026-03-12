// src/lib/generate-static-params.js
// generateStaticParams helpers — dùng trong tất cả [slug] routes.
//
// ✅ PERF FIX — Thiếu generateStaticParams → Next.js render on-demand
//    (dynamic rendering) cho mọi request đầu tiên → TTFB chậm.
//    Với generateStaticParams → build-time pre-render → HTML sẵn sàng → ~0ms TTFB.
//
// Pattern: mỗi [slug]/page.js export hàm này để Next.js biết
//    slug nào cần pre-render lúc build.
//
// Caching: revalidate = 1800 → 30 phút ISR (Incremental Static Regeneration)
//    → Slugs mới vẫn được generate on-demand, cached sau lần đầu.

import sql from "@/lib/db"

// ── Helper chung ──────────────────────────────────────────────────────────────

async function fetchSlugs(query) {
  try {
    const rows = await query
    return rows.map(r => ({ slug: r.slug }))
  } catch (err) {
    // Không crash build nếu DB không có dữ liệu lúc build
    console.warn("[generateStaticParams] Failed to fetch slugs:", err.message)
    return []
  }
}

// ── Per-route exports ─────────────────────────────────────────────────────────

/**
 * events/[slug]/page.js:
 *   export { generateEventStaticParams as generateStaticParams }
 */
export async function generateEventStaticParams() {
  return fetchSlugs(sql`
    SELECT slug FROM events
    WHERE status IN ('PUBLISHED', 'UPCOMING', 'ONGOING')
    ORDER BY start_date DESC
    LIMIT 200
  `)
}

/**
 * news/[slug]/page.js:
 *   export { generateArticleStaticParams as generateStaticParams }
 */
export async function generateArticleStaticParams() {
  return fetchSlugs(sql`
    SELECT slug FROM articles
    WHERE status = 'PUBLISHED'
    ORDER BY published_at DESC
    LIMIT 500
  `)
}

/**
 * programs/[slug]/page.js:
 *   export { generateProgramStaticParams as generateStaticParams }
 */
export async function generateProgramStaticParams() {
  return fetchSlugs(sql`
    SELECT slug FROM programs
    WHERE status IN ('ACTIVE', 'PUBLISHED')
    ORDER BY updated_at DESC
    LIMIT 100
  `)
}

/**
 * startups/[slug]/page.js:
 *   export { generateStartupStaticParams as generateStaticParams }
 */
export async function generateStartupStaticParams() {
  return fetchSlugs(sql`
    SELECT slug FROM startups
    WHERE is_published = true
    ORDER BY updated_at DESC
    LIMIT 300
  `)
}

/**
 * mentors/[slug]/page.js:
 *   export { generateMentorStaticParams as generateStaticParams }
 */
export async function generateMentorStaticParams() {
  return fetchSlugs(sql`
    SELECT slug FROM mentors
    WHERE is_active = true
    ORDER BY updated_at DESC
    LIMIT 200
  `)
}

/**
 * resources/[slug]/page.js:
 *   export { generateResourceStaticParams as generateStaticParams }
 */
export async function generateResourceStaticParams() {
  return fetchSlugs(sql`
    SELECT slug FROM resources
    WHERE is_published = true
    ORDER BY updated_at DESC
    LIMIT 200
  `)
}