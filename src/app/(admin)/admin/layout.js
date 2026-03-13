// src/app/(admin)/admin/layout.js
// Admin layout — bọc tất cả admin pages với sidebar + header
// Auth được xử lý bởi proxy.js (middleware), không redirect ở đây

import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth.config"
import { SessionProvider }  from "@/components/session-provider"
import { AdminShell }       from "@/components/admin/admin-shell"

export const metadata = {
  title: { template: "%s — SCEI Admin", default: "SCEI Admin" },
  robots: { index: false, follow: false }, // Không index trang admin
}

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <SessionProvider session={session}>
      <AdminShell>
        {children}
      </AdminShell>
    </SessionProvider>
  )
}