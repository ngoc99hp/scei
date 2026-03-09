// src/middleware.js
// 1. Bảo vệ /admin/* → redirect về /admin/login nếu chưa đăng nhập
// 2. Rate limit /api/contact, /api/events/*, /api/programs/*

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { rateLimit } from "@/lib/rate-limit"

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1"

    // Rate limit public form endpoints
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
      authorized({ req, token }) {
        const { pathname } = req.nextUrl
        if (pathname === "/admin/login") return true
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/contact",
    "/api/events/:path*",
    "/api/programs/:path*",
  ],
}