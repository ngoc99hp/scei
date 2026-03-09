// src/app/(admin)/layout.js
// Layout bọc toàn bộ /admin — cung cấp SessionProvider + fallback auth

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import { SessionProvider } from "@/components/session-provider"

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)

  // Fallback auth: nếu chưa đăng nhập redirect (middleware đã lo phần này,
  // đây là lớp bảo vệ thứ 2 cho trường hợp middleware bị bypass)
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}