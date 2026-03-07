// src/middleware.js
// 1. Bảo vệ /admin/* → redirect về /admin/login nếu chưa đăng nhập
// 2. Rate limit /api/contact, /api/events/*, /api/programs/*

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Simple in-memory rate limiter (đủ dùng cho Vercel serverless)
const rateLimitMap = new Map()

function checkRateLimit(ip, maxRequests = 10, windowMs = 60_000) {
  const now    = Date.now()
  const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs }

  if (now > record.resetAt) {
    record.count   = 0
    record.resetAt = now + windowMs
  }

  record.count++
  rateLimitMap.set(ip, record)

  return {
    ok:        record.count <= maxRequests,
    remaining: Math.max(0, maxRequests - record.count),
  }
}

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1"

    // Rate limit public form endpoints
    const isPublicApi =
      pathname === "/api/contact" ||
      pathname.startsWith("/api/events/") ||
      pathname.startsWith("/api/programs/")

    if (isPublicApi) {
      const { ok, remaining } = checkRateLimit(ip)
      if (!ok) {
        return NextResponse.json(
          { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút." },
          { status: 429, headers: { "Retry-After": "60" } }
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

        // /admin/login luôn public
        if (pathname === "/admin/login") return true

        // /admin/* và /api/admin/* cần đăng nhập
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