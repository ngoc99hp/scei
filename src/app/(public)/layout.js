// src/app/(public)/layout.js
// ✅ Tách header và footer thành component riêng để dễ maintain.
// Layout giờ chỉ còn là shell — toàn bộ UI logic nằm trong component.

import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        {children}
      </main>
      <PublicFooter />
    </div>
  )
}
