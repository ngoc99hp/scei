// src/lib/auth.js
// Helper functions cho authentication
// Import authOptions từ auth.config.js (không phải route handler)

import { getServerSession } from "next-auth"
import { authOptions }     from "@/lib/auth.config"
import { redirect }        from "next/navigation"

/**
 * Lấy session trong Server Component.
 * Tự động redirect về /admin/login nếu chưa đăng nhập.
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")
  return session
}

/**
 * Lấy session, trả về null nếu chưa đăng nhập (không redirect).
 */
export async function getSession() {
  return getServerSession(authOptions)
}

/**
 * Kiểm tra auth trong API Route Handler.
 * @returns {{ authorized: true, session } | { authorized: false, response: Response }}
 */
export async function checkApiAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return {
      authorized: false,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }
  return { authorized: true, session }
}

/**
 * Guard dùng chung cho tất cả Admin API Route Handlers.
 *
 * Thay thế các hàm requireAdmin() local trong từng file route,
 * loại bỏ code trùng lặp và chuẩn hóa response format.
 *
 * @returns {{ ok: true, session } | { ok: false, res: Response }}
 *
 * @example
 * export async function GET(req) {
 *   const auth = await requireApiAdmin()
 *   if (!auth.ok) return auth.res
 *   // auth.session.user.id, auth.session.user.role, ...
 * }
 */
export async function requireApiAdmin() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      ok:  false,
      res: Response.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (session.user?.role !== "ADMIN") {
    return {
      ok:  false,
      res: Response.json({ error: "Forbidden" }, { status: 403 }),
    }
  }

  return { ok: true, session }
}