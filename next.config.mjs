// // next.config.mjs
// /** @type {import('next').NextConfig} */

// const IS_PROD = process.env.NODE_ENV === "production"

// // ── Security Headers ──────────────────────────────────────────────────────────
// //
// // Áp dụng cho tất cả routes (source: "/(.*)")
// // Các header này bảo vệ khỏi các attack phổ biến:
// //   - Clickjacking (X-Frame-Options)
// //   - MIME sniffing (X-Content-Type-Options)
// //   - XSS via reflected content (X-XSS-Protection)
// //   - Referrer leaking (Referrer-Policy)
// //   - Browser feature abuse (Permissions-Policy)
// //   - Protocol downgrade (Strict-Transport-Security) — chỉ production
// //   - Cross-origin isolation (Cross-Origin-*) — tùy chọn, bật nếu dùng SharedArrayBuffer
// //
// // KHÔNG thêm Content-Security-Policy ở đây vì:
// //   - Next.js inject inline scripts (React hydration, JSON-LD...)
// //   - CSP cần whitelist chi tiết, tránh false positive → nên cấu hình riêng
// //     sau khi đã stable, hoặc dùng nonce-based CSP với middleware

// const securityHeaders = [
//   // Ngăn trang bị nhúng vào iframe → chống Clickjacking
//   // SAMEORIGIN: chỉ cho phép iframe từ cùng origin (ví dụ admin panel)
//   {
//     key: "X-Frame-Options",
//     value: "SAMEORIGIN",
//   },

//   // Ngăn browser đoán MIME type từ nội dung file
//   // Ví dụ: upload file .txt chứa HTML → browser không render như HTML
//   {
//     key: "X-Content-Type-Options",
//     value: "nosniff",
//   },

//   // Bật XSS filter của browser cũ (IE, Chrome < 78)
//   // Browser hiện đại không cần nhưng vô hại
//   {
//     key: "X-XSS-Protection",
//     value: "1; mode=block",
//   },

//   // Kiểm soát thông tin Referer gửi khi navigate
//   // strict-origin-when-cross-origin:
//   //   - Same origin: gửi full URL
//   //   - Cross origin HTTPS→HTTPS: chỉ gửi origin (không gửi path)
//   //   - Cross origin HTTPS→HTTP: không gửi gì
//   {
//     key: "Referrer-Policy",
//     value: "strict-origin-when-cross-origin",
//   },

//   // Tắt các browser API không dùng → giảm attack surface
//   // camera, microphone: không dùng
//   // geolocation: không dùng
//   // payment: không dùng (không có e-commerce)
//   // usb, bluetooth: không dùng
//   {
//     key: "Permissions-Policy",
//     value: [
//       "camera=()",
//       "microphone=()",
//       "geolocation=()",
//       "payment=()",
//       "usb=()",
//       "bluetooth=()",
//       "interest-cohort=()",  // Tắt FLoC tracking của Google
//     ].join(", "),
//   },

//   // Ngăn browser cross-origin embed đọc response (CORP)
//   // same-origin: chỉ cho phép load resource từ cùng origin
//   // Nới lỏng thành "cross-origin" nếu dùng CDN cho static assets
//   {
//     key: "Cross-Origin-Resource-Policy",
//     value: "same-origin",
//   },

//   // HSTS — bắt buộc HTTPS, ngăn protocol downgrade attack
//   // CHỈ bật trên production để không phá local dev (HTTP)
//   // max-age=63072000 = 2 năm (Google HSTS preload yêu cầu tối thiểu 1 năm)
//   // includeSubDomains: áp dụng cho tất cả subdomain
//   // preload: đăng ký vào HSTS preload list của browser (tùy chọn)
//   ...(IS_PROD
//     ? [
//         {
//           key: "Strict-Transport-Security",
//           value: "max-age=63072000; includeSubDomains; preload",
//         },
//       ]
//     : []),
// ]

// const nextConfig = {
//   // ── Images ─────────────────────────────────────────────────────────────────
//   images: {
//     remotePatterns: [
//       // Cloudinary (production uploads)
//       {
//         protocol: "https",
//         hostname: "res.cloudinary.com",
//       },
//       // Unsplash (placeholder images trong seed data)
//       {
//         protocol: "https",
//         hostname: "images.unsplash.com",
//       },
//       // Pravatar (avatar placeholder trong seed data)
//       {
//         protocol: "https",
//         hostname: "i.pravatar.cc",
//       },
//     ],
//   },

//   // ── Security Headers ────────────────────────────────────────────────────────
//   async headers() {
//     return [
//       {
//         // Áp dụng cho tất cả routes
//         source: "/(.*)",
//         headers: securityHeaders,
//       },
//       {
//         // Admin routes: thêm X-Frame-Options DENY (không cho iframe admin từ bất kỳ đâu)
//         source: "/admin/:path*",
//         headers: [
//           { key: "X-Frame-Options", value: "DENY" },
//           // Cache-Control: không cache admin pages
//           { key: "Cache-Control", value: "no-store, max-age=0" },
//         ],
//       },
//       {
//         // API routes: không cache, không index
//         source: "/api/:path*",
//         headers: [
//           { key: "Cache-Control", value: "no-store, max-age=0" },
//           { key: "X-Robots-Tag", value: "noindex" },
//         ],
//       },
//     ]
//   },
// }

// console.log(
//   "✅ next.config.mjs loaded, remotePatterns:",
//   nextConfig.images.remotePatterns.map((r) => r.hostname)
// )

// export default nextConfig

// next.config.mjs
/** @type {import('next').NextConfig} */

const IS_PROD = process.env.NODE_ENV === "production"

// ── Security Headers ──────────────────────────────────────────────────────────
//
// Áp dụng cho tất cả routes (source: "/(.*)")
// Các header này bảo vệ khỏi các attack phổ biến:
//   - Clickjacking (X-Frame-Options)
//   - MIME sniffing (X-Content-Type-Options)
//   - XSS via reflected content (X-XSS-Protection)
//   - Referrer leaking (Referrer-Policy)
//   - Browser feature abuse (Permissions-Policy)
//   - Protocol downgrade (Strict-Transport-Security) — chỉ production
//   - Cross-origin isolation (Cross-Origin-*) — tùy chọn, bật nếu dùng SharedArrayBuffer
//
// KHÔNG thêm Content-Security-Policy ở đây vì:
//   - Next.js inject inline scripts (React hydration, JSON-LD...)
//   - CSP cần whitelist chi tiết, tránh false positive → nên cấu hình riêng
//     sau khi đã stable, hoặc dùng nonce-based CSP với middleware

const securityHeaders = [
  // Ngăn trang bị nhúng vào iframe → chống Clickjacking
  // SAMEORIGIN: chỉ cho phép iframe từ cùng origin (ví dụ admin panel)
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },

  // Ngăn browser đoán MIME type từ nội dung file
  // Ví dụ: upload file .txt chứa HTML → browser không render như HTML
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },

  // Bật XSS filter của browser cũ (IE, Chrome < 78)
  // Browser hiện đại không cần nhưng vô hại
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },

  // Kiểm soát thông tin Referer gửi khi navigate
  // strict-origin-when-cross-origin:
  //   - Same origin: gửi full URL
  //   - Cross origin HTTPS→HTTPS: chỉ gửi origin (không gửi path)
  //   - Cross origin HTTPS→HTTP: không gửi gì
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },

  // Tắt các browser API không dùng → giảm attack surface
  // camera, microphone: không dùng
  // geolocation: không dùng
  // payment: không dùng (không có e-commerce)
  // usb, bluetooth: không dùng
  {
    key: "Permissions-Policy",
    // interest-cohort đã bị xóa khỏi spec từ Chrome 115, gây console warning
    value: [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "payment=()",
      "usb=()",
      "bluetooth=()",
    ].join(", "),
  },

  // Ngăn browser cross-origin embed đọc response (CORP)
  // same-origin: chỉ cho phép load resource từ cùng origin
  // Nới lỏng thành "cross-origin" nếu dùng CDN cho static assets
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },

  // HSTS — bắt buộc HTTPS, ngăn protocol downgrade attack
  // CHỈ bật trên production để không phá local dev (HTTP)
  // max-age=63072000 = 2 năm (Google HSTS preload yêu cầu tối thiểu 1 năm)
  // includeSubDomains: áp dụng cho tất cả subdomain
  // preload: đăng ký vào HSTS preload list của browser (tùy chọn)
  ...(IS_PROD
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
]

const nextConfig = {
  // Ẩn "X-Powered-By: Next.js" header — tránh leak thông tin server
  poweredByHeader: false,

  // ── Images ─────────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      // Cloudinary (production uploads)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      // Unsplash (placeholder images trong seed data)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // Pravatar (avatar placeholder trong seed data)
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
    ],
  },

  // ── Security Headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Áp dụng cho tất cả routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Admin routes: thêm X-Frame-Options DENY (không cho iframe admin từ bất kỳ đâu)
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          // Cache-Control: không cache admin pages
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      {
        // API routes: không cache, không index
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex" },
        ],
      },
    ]
  },
}

export default nextConfig
