"use client"
// src/components/admin/admin-shell.jsx
// Shell bọc toàn bộ admin UI: sidebar + header + content
// Quản lý: collapsed state, mobile drawer

import { useState, useEffect } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader }  from "./admin-header"
import { usePathname }  from "next/navigation"

export function AdminShell({ children }) {
  const pathname = usePathname()

  // Desktop: sidebar collapsed/expanded
  const [collapsed, setCollapsed] = useState(false)

  // Mobile: drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false)

  // Đóng mobile drawer khi navigate
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Persist collapsed state in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed")
    if (saved !== null) setCollapsed(saved === "true")
  }, [])

  function handleToggle() {
    setCollapsed((v) => {
      localStorage.setItem("admin-sidebar-collapsed", String(!v))
      return !v
    })
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Desktop sidebar ── */}
      <div className="hidden md:flex shrink-0">
        <AdminSidebar
          collapsed={collapsed}
          onToggle={handleToggle}
          isMobile={false}
        />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed left-0 top-0 bottom-0 z-50 md:hidden flex">
            <AdminSidebar
              collapsed={false}
              onClose={() => setMobileOpen(false)}
              isMobile={true}
            />
          </div>
        </>
      )}

      {/* ── Main content area ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}