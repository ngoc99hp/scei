// src/lib/auth.js
// Helper functions cho authentication
// Import authOptions từ auth.config.js (không phải route handler)

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"

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