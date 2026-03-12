// src/lib/generate-static-params.js
// generateStaticParams helpers — dùng trong tất cả [slug] routes.
//
// ✅ FIX — Sửa status values cho khớp schema thực tế:
//   events:   DRAFT|OPEN|FULL|ONGOING|COMPLETED|CANCELLED  (không có PUBLISHED/UPCOMING)
//   programs: DRAFT|OPEN|CLOSED|COMPLETED                  (không có ACTIVE/PUBLISHED)
//   mentors:  không có cột is_active → dùng is_published + status = 'ACTIVE'

import sql from "@/lib/db"

async function fetchSlugs(query) {
  try {
    const rows = await query
    return rows.map(r => ({ slug: r.slug }))
  } catch (err) {
    console.warn("[generateStaticParams] Failed to fetch slugs:", err.message)
    return []
  }
}

export async function generateEventStaticParams() {
  return fetchSlugs(sql`
    SELECT slug FROM events
    WHERE is_published = true
      AND status IN ('OPEN', 'ONGOING', 'FULL', 'COMPLETED')
    ORDER BY start_date DESC
    LIMIT 200
  `)
}

export async function generateArticleStaticParams() {
  return fetchSlugs(sql`
    SELECT slug FROM articles
    WHERE status = 'PUBLISHED'
    ORDER BY published_at DESC
    LIMIT 500
  `)
}

export async function generateProgramStaticParams() {
  return fetchSlugs(sql`
    SELECT slug FROM programs
    WHERE is_published = true
      AND status IN ('OPEN', 'CLOSED', 'COMPLETED')
    ORDER BY updated_at DESC
    LIMIT 100
  `)
}

export async function generateStartupStaticParams() {
  return fetchSlugs(sql`
    SELECT slug FROM startups
    WHERE is_published = true
    ORDER BY updated_at DESC
    LIMIT 300
  `)
}

export async function generateMentorStaticParams() {
  // Schema: không có cột is_active → dùng is_published + status
  return fetchSlugs(sql`
    SELECT slug FROM mentors
    WHERE is_published = true
      AND status = 'ACTIVE'
    ORDER BY updated_at DESC
    LIMIT 200
  `)
}

export async function generateResourceStaticParams() {
  return fetchSlugs(sql`
    SELECT slug FROM resources
    WHERE is_published = true
    ORDER BY updated_at DESC
    LIMIT 200
  `)
}