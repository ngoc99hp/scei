// src/app/sitemap.js
// Dynamic XML sitemap — Google dùng để crawl đúng và đầy đủ.
//
// ✅ SEO FIX — Thiếu sitemap → Google không biết URL nào cần index,
//    không biết bài viết mới nhất để crawl sớm.
//
// Kết quả: GET /sitemap.xml → XML chuẩn với:
//   - Static pages (home, about, contact, events, news, programs...)
//   - Dynamic slugs (mỗi article, event, program, startup, mentor)
//   - lastModified, changeFrequency, priority đúng cho từng loại
//
// Revalidate 6h — đủ nhanh cho content mới, đủ chậm để tránh DB spam.

import sql from "@/lib/db"

export const revalidate = 21600 // 6 giờ

const BASE = process.env.NEXT_PUBLIC_SITE_URL

// ── Helper: fetch slugs an toàn (không crash sitemap nếu 1 query fail) ───────
async function safeFetch(query) {
  try { return await query }
  catch { return [] }
}

export default async function sitemap() {
  // Fetch tất cả slugs song song
  const [articles, events, programs, startups, mentors] = await Promise.all([
    safeFetch(sql`
      SELECT slug, updated_at
      FROM articles
      WHERE status = 'PUBLISHED'
      ORDER BY updated_at DESC
    `),
    safeFetch(sql`
      SELECT slug, updated_at
      FROM events
      WHERE status IN ('PUBLISHED', 'UPCOMING', 'ONGOING')
      ORDER BY start_date DESC
    `),
    safeFetch(sql`
      SELECT slug, updated_at
      FROM programs
      WHERE status IN ('ACTIVE', 'PUBLISHED')
      ORDER BY updated_at DESC
    `),
    safeFetch(sql`
      SELECT slug, updated_at
      FROM startups
      WHERE is_published = true
      ORDER BY updated_at DESC
    `),
    safeFetch(sql`
      SELECT slug, updated_at
      FROM mentors
      WHERE is_active = true
      ORDER BY updated_at DESC
    `),
  ])

  // ── Static pages ─────────────────────────────────────────────────────────
  const staticPages = [
    { url: BASE,            priority: 1.0, changeFrequency: "weekly"  },
    { url: `${BASE}/about`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/contact`, priority: 0.6, changeFrequency: "monthly" },
  ]

  // ── Section index pages ───────────────────────────────────────────────────
  const sectionPages = [
    { url: `${BASE}/news`,     priority: 0.9, changeFrequency: "daily"   },
    { url: `${BASE}/events`,   priority: 0.9, changeFrequency: "daily"   },
    { url: `${BASE}/programs`, priority: 0.8, changeFrequency: "weekly"  },
    { url: `${BASE}/startups`, priority: 0.8, changeFrequency: "weekly"  },
    { url: `${BASE}/mentors`,  priority: 0.7, changeFrequency: "weekly"  },
    { url: `${BASE}/resources`,priority: 0.7, changeFrequency: "weekly"  },
  ]

  // ── Dynamic slug pages ────────────────────────────────────────────────────
  const articleUrls = articles.map(a => ({
    url:             `${BASE}/news/${a.slug}`,
    lastModified:    a.updated_at ? new Date(a.updated_at) : new Date(),
    priority:        0.8,
    changeFrequency: "weekly",
  }))

  const eventUrls = events.map(e => ({
    url:             `${BASE}/events/${e.slug}`,
    lastModified:    e.updated_at ? new Date(e.updated_at) : new Date(),
    priority:        0.8,
    changeFrequency: "weekly",
  }))

  const programUrls = programs.map(p => ({
    url:             `${BASE}/programs/${p.slug}`,
    lastModified:    p.updated_at ? new Date(p.updated_at) : new Date(),
    priority:        0.8,
    changeFrequency: "monthly",
  }))

  const startupUrls = startups.map(s => ({
    url:             `${BASE}/startups/${s.slug}`,
    lastModified:    s.updated_at ? new Date(s.updated_at) : new Date(),
    priority:        0.7,
    changeFrequency: "monthly",
  }))

  const mentorUrls = mentors.map(m => ({
    url:             `${BASE}/mentors/${m.slug}`,
    lastModified:    m.updated_at ? new Date(m.updated_at) : new Date(),
    priority:        0.6,
    changeFrequency: "monthly",
  }))

  return [
    ...staticPages.map(p => ({ ...p, lastModified: new Date() })),
    ...sectionPages.map(p => ({ ...p, lastModified: new Date() })),
    ...articleUrls,
    ...eventUrls,
    ...programUrls,
    ...startupUrls,
    ...mentorUrls,
  ]
}