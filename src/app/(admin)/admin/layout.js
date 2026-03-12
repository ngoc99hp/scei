// src/app/(admin)/admin/layout.js
//
// ✅ FIX redirect loop — Bỏ auth check khỏi layout.
//
// Lý do loop xảy ra:
//   1. proxy.js (withAuth) chặn /admin/* nếu không có token → redirect /admin/login
//   2. layout.js gọi getServerSession() → không có session → redirect /admin/login
//   3. Browser hit /admin/login → layout chạy lại → redirect → loop
//
// Nguyên tắc: CHỈ một nơi xử lý auth redirect.
//   → proxy.js đã lo redirect, layout KHÔNG redirect thêm.
//   → Layout chỉ cần lấy session để pass vào SessionProvider.
//
// Defense in depth vẫn đảm bảo vì:
//   - proxy.js chặn ở edge trước khi request vào layout
//   - admin/page.js vẫn check session.user.role === "ADMIN"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { SessionProvider } from "@/components/session-provider"

export default async function AdminLayout({ children }) {
  // Lấy session để pass vào SessionProvider cho Client Components dùng
  // KHÔNG redirect ở đây — proxy.js đã xử lý rồi
  const session = await getServerSession(authOptions)

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}