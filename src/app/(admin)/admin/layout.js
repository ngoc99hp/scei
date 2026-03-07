// src/app/(admin)/layout.js
// Layout bọc toàn bộ admin — cung cấp SessionProvider cho client components

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { SessionProvider } from "@/components/session-provider"

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions)

  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}