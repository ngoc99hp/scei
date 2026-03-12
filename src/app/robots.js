// src/app/robots.js
// Robots.txt — kiểm soát crawler nào được index trang nào.
//
// ✅ SEO FIX — Thiếu robots.txt → Google có thể index admin routes,
//    API routes, search result pages với ?page= params → duplicate content.
//
// Kết quả: GET /robots.txt

const BASE = process.env.NEXT_PUBLIC_SITE_URL

export default function robots() {
  return {
    rules: [
      {
        // Crawler thông thường (Googlebot, Bingbot...)
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",          // Toàn bộ admin panel
          "/admin/",
          "/api/",           // API routes không cần index
          "/_next/",         // Next.js internals
          "/search?",        // Search result pages (duplicate content)
          "/*?page=",        // Pagination params (canonical handles này)
          "/*?category=",    // Filter params
          "/*?sort=",
          "/*?q=",
          "/auth/",
        ],
      },
      {
        // GPTBot (OpenAI training) — opt-out
        userAgent: "GPTBot",
        disallow: "/",
      },
      {
        // CCBot (Common Crawl — training data) — opt-out
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host:    BASE,
  }
}