// src/lib/page-config.js
// Cấu hình revalidate + generateStaticParams chuẩn cho từng route type.
//
// ✅ PERF FIX 3 — Revalidation strategy đúng cho từng loại content:
//    - News articles: 1 giờ (content thay đổi trung bình)
//    - Events: 15 phút (registered_count thay đổi thường xuyên)
//    - Programs: 1 giờ
//    - Startups/Mentors: 6 giờ (thay đổi ít)
//    - List pages: phụ thuộc content type
//
// ✅ PERF FIX 4 — generateStaticParams: pre-render lúc build,
//    dùng ISR cho slugs mới (on-demand sau khi tạo)
//
// Cách dùng trong page.js:
//   export { revalidate }   từ file này, hoặc
//   export const revalidate = REVALIDATE.events
//   export { generateEventStaticParams as generateStaticParams }

// ── Revalidate constants ──────────────────────────────────────────────────────
export const REVALIDATE = {
  // Static pages — thay đổi rất ít
  static:   86400, // 24h

  // News articles — không cần realtime
  articles:  3600, // 1h

  // Events — registered_count thay đổi thường
  // Giảm xuống 15p so với 30p cũ để registered_count không stale quá lâu
  events:     900, // 15 phút

  // Programs
  programs:  3600, // 1h

  // Startups / Mentors / Resources — ít thay đổi
  profiles:  21600, // 6h

  // List pages — nên fresh hơn để hiện content mới
  list:      1800, // 30 phút
}

// ── generateStaticParams docs ─────────────────────────────────────────────────
//
// Trong mỗi [slug]/page.js, thêm:
//
//   import { generateEventStaticParams } from "@/lib/generate-static-params"
//   export const generateStaticParams = generateEventStaticParams
//   export const revalidate = REVALIDATE.events
//
// Kết quả build:
//   ○ /events              (static)
//   ● /events/[slug]       (ISR, revalidate=900s)
//   └ /events/scei-hackathon-2026  (pre-rendered)
//   └ /events/startup-weekend      (pre-rendered)
//   └ ...200 events                (pre-rendered)
//
// Slugs chưa có lúc build → first request render on-demand → cache 900s