// src/app/not-found.js
// Global 404 page — hiển thị khi notFound() được gọi hoặc route không tồn tại.
// Đây là Server Component (không có "use client").
//
// Next.js tự động render file này khi:
//   1. notFound() được gọi trong bất kỳ page/layout nào
//   2. URL không match bất kỳ route nào trong app

import Link from "next/link"

export const metadata = {
  title: "404 — Trang không tìm thấy | SCEI",
}

const QUICK_LINKS = [
  { href: "/",         label: "Trang chủ" },
  { href: "/programs", label: "Chương trình" },
  { href: "/events",   label: "Sự kiện" },
  { href: "/news",     label: "Tin tức" },
  { href: "/contact",  label: "Liên hệ" },
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Illustration */}
        <div className="relative mb-8">
          <p className="text-[8rem] font-black text-primary/10 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-5xl" aria-hidden="true">🔍</div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Trang không tìm thấy
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Trang bạn đang tìm kiếm không tồn tại, đã bị di chuyển, hoặc URL bị nhập sai.
        </p>

        {/* Primary action */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mb-8"
        >
          ← Về trang chủ
        </Link>

        {/* Quick links */}
        <div className="border-t border-border pt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Có thể bạn đang tìm
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_LINKS.filter(l => l.href !== "/").map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}