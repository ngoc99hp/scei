"use client"
// src/components/admin/admin-sidebar.jsx
// Sidebar điều hướng admin — dark theme, collapsible trên mobile

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useState } from "react"
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Rocket,
  Users2,
  ClipboardList,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"

// ─── Navigation structure ────────────────────────────────────
const NAV = [
  {
    label: "Tổng quan",
    items: [
      { href: "/admin",          icon: LayoutDashboard, label: "Dashboard" },
    ],
  },
  {
    label: "Nội dung",
    items: [
      { href: "/admin/articles",  icon: Newspaper,      label: "Bài viết" },
      { href: "/admin/events",    icon: CalendarDays,   label: "Sự kiện" },
      { href: "/admin/programs",  icon: GraduationCap,  label: "Chương trình" },
      { href: "/admin/resources", icon: BookOpen,       label: "Tài nguyên" },
      { href: "/admin/startups",  icon: Rocket,         label: "Startup" },
      { href: "/admin/mentors",   icon: Users2,         label: "Mentor" },
    ],
  },
  {
    label: "Tương tác",
    items: [
      { href: "/admin/registrations", icon: ClipboardList, label: "Đăng ký sự kiện" },
      { href: "/admin/applications",  icon: FileText,      label: "Đơn xét tuyển" },
      { href: "/admin/contacts",      icon: MessageSquare, label: "Liên hệ" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { href: "/admin/users",    icon: Users2,   label: "Tài khoản" },
      { href: "/admin/settings", icon: Settings, label: "Cài đặt" },
    ],
  },
]

// ─── Nav item ────────────────────────────────────────────────
function NavItem({ href, icon: Icon, label, collapsed, exact = false }) {
  const pathname  = usePathname()
  const isActive  = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/")

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={[
        "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 relative",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-sm"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        collapsed ? "justify-center px-2" : "",
      ].join(" ")}
    >
      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
      )}

      <Icon size={16} className={isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground transition-colors"} />

      {!collapsed && (
        <span className="truncate">{label}</span>
      )}

      {/* Tooltip khi collapsed */}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-md bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
          {label}
        </span>
      )}
    </Link>
  )
}

// ─── Nav group ───────────────────────────────────────────────
function NavGroup({ label, items, collapsed }) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <p className="px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase text-sidebar-foreground/30 select-none">
          {label}
        </p>
      )}
      {collapsed && <div className="mx-3 border-t border-sidebar-border my-2" />}
      {items.map((item) => (
        <NavItem
          key={item.href}
          {...item}
          collapsed={collapsed}
          exact={item.href === "/admin"}
        />
      ))}
    </div>
  )
}

// ─── Main Sidebar ────────────────────────────────────────────
export function AdminSidebar({ collapsed, onToggle, onClose, isMobile }) {
  return (
    <aside className={[
      "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out h-full",
      collapsed ? "w-[60px]" : "w-[220px]",
    ].join(" ")}>

      {/* ── Header ── */}
      <div className={[
        "flex items-center border-b border-sidebar-border shrink-0",
        collapsed ? "justify-center h-14 px-2" : "justify-between h-14 px-4",
      ].join(" ")}>
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-bold">S</span>
            </div>
            <span className="font-semibold text-sm text-sidebar-foreground truncate">SCEI Admin</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
        )}

        {/* Close button (mobile) / Collapse button (desktop) */}
        {isMobile ? (
          <button onClick={onClose} className="text-sidebar-foreground/50 hover:text-sidebar-foreground p-1 rounded transition-colors">
            <X size={16} />
          </button>
        ) : (
          !collapsed && (
            <button onClick={onToggle} title="Thu gọn sidebar" className="text-sidebar-foreground/40 hover:text-sidebar-foreground p-1 rounded transition-colors">
              <PanelLeftClose size={15} />
            </button>
          )
        )}
      </div>

      {/* Expand button khi collapsed (desktop only) */}
      {collapsed && !isMobile && (
        <button
          onClick={onToggle}
          title="Mở rộng sidebar"
          className="mx-2 mt-2 p-1.5 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors flex justify-center"
        >
          <PanelLeftOpen size={15} />
        </button>
      )}

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-4 scrollbar-thin">
        {NAV.map((group) => (
          <NavGroup key={group.label} {...group} collapsed={collapsed} />
        ))}
      </nav>

      {/* ── Footer (logout) ── */}
      <div className="shrink-0 border-t border-sidebar-border p-2">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          title={collapsed ? "Đăng xuất" : undefined}
          className={[
            "group flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150",
            collapsed ? "justify-center px-2" : "",
          ].join(" ")}
        >
          <LogOut size={15} className="shrink-0" />
          {!collapsed && <span>Đăng xuất</span>}

          {collapsed && (
            <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-md bg-gray-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
              Đăng xuất
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}