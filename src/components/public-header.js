// src/components/public-header.js
// Header cho public layout — tách ra từ layout.js để dễ maintain.
// Server Component (không có "use client") — PublicNav bên trong mới là Client Component.

import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { PublicNav } from "@/components/public-nav"

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold shrink-0">
          SCEI
        </Link>

        {/* Nav links — ẩn trên mobile, PublicNav tự xử lý hamburger */}
        <PublicNav />

        {/* Right side actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* <ThemeToggle /> */}
        </div>
      </nav>
    </header>
  )
}
