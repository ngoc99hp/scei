// src/proxy.js  ← Next.js 16: file PHẢI tên proxy.js (hoặc proxy.ts)
//
// Next.js 16 đã đổi convention từ middleware → proxy.
// Chạy codemod nếu chưa migrate: npx @next/codemod@canary middleware-to-proxy .
//
// ⚠️  TƯƠNG THÍCH next-auth/middleware + proxy convention:
//   withAuth() từ next-auth v4 wrap function tên "proxy" hoạt động bình thường —
//   Next.js chỉ quan tâm tên FILE (proxy.js), không quan tâm tên function bên trong.
//
//   Nếu upgrade lên next-auth v5 (Auth.js), đổi thành:
//       import { auth } from "@/auth"
//       export default auth(async (req) => { ... })

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"

export default withAuth(
  async function proxy(req) {
    const { pathname } = req.nextUrl

    // Lấy IP thực (Vercel forward header)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1"

    const isPublicApi =
      pathname === "/api/contact" ||
      pathname.startsWith("/api/events/") ||
      pathname.startsWith("/api/programs/")

    if (isPublicApi) {
      const { ok, remaining, reset } = await rateLimit(ip)

      if (!ok) {
        return NextResponse.json(
          { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
          {
            status: 429,
            headers: {
              "Retry-After": String(reset),
              "X-RateLimit-Remaining": "0",
            },
          }
        )
      }

      const res = NextResponse.next()
      res.headers.set("X-RateLimit-Remaining", String(remaining))
      return res
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      /**
       * authorized() chạy TRƯỚC function middleware ở trên.
       * Trả về false → Next.js redirect về trang login (jwt.pages.signIn hoặc /api/auth/signin).
       * Trả về true  → tiếp tục vào function middleware.
       *
       * Lưu ý Next.js 16: callback này nhận { req, token } – không thay đổi so với trước.
       */
      authorized({ req, token }) {
        const { pathname } = req.nextUrl

        // Trang login luôn được phép
        if (pathname === "/admin/login") return true

        // Các route admin yêu cầu đăng nhập
        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/api/admin")
        ) {
          return !!token
        }

        // Tất cả route còn lại (public) cho qua
        return true
      },
    },
  }
)

// matcher giữ nguyên – Next.js 16 không thay đổi cú pháp config
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/contact",
    "/api/events/:path*",
    "/api/programs/:path*",
  ],
}