// src/lib/auth.js
// Helper functions cho authentication
// Dùng trong Server Components và API Route Handlers

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

/**
 * Lấy session trong Server Component
 * Tự động redirect về /admin/login nếu chưa đăng nhập
 *
 * @example
 * // Trong server component:
 * const session = await requireAuth()
 * console.log(session.user.email)
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/admin/login")
  }
  return session
}

/**
 * Lấy session, trả về null nếu chưa đăng nhập (không redirect)
 * Dùng cho component vừa public vừa có trạng thái logged-in
 */
export async function getSession() {
  return getServerSession(authOptions)
}

/**
 * Kiểm tra auth trong API Route Handler
 * Trả về { authorized: true, session } hoặc { authorized: false, response }
 *
 * @example
 * // Trong route.js:
 * const auth = await checkApiAuth()
 * if (!auth.authorized) return auth.response
 * const { session } = auth
 */
export async function checkApiAuth() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return {
      authorized: false,
      response: new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      ),
    }
  }
  return { authorized: true, session }
}