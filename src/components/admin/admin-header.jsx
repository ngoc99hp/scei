"use client"
// src/components/admin/admin-header.jsx
// Topbar admin — breadcrumb, user info, mobile menu toggle

import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { Menu, ChevronRight } from "lucide-react"

// ─── Breadcrumb mapping ──────────────────────────────────────
const LABELS = {
  admin:         "Dashboard",
  articles:      "Bài viết",
  events:        "Sự kiện",
  programs:      "Chương trình",
  resources:     "Tài nguyên",
  startups:      "Startup",
  mentors:       "Mentor",
  registrations: "Đăng ký sự kiện",
  applications:  "Đơn xét tuyển",
  contacts:      "Liên hệ",
  users:         "Tài khoản",
  settings:      "Cài đặt",
  new:           "Tạo mới",
  edit:          "Chỉnh sửa",
  login:         "Đăng nhập",
}

function buildCrumbs(pathname) {
  const parts = pathname.split("/").filter(Boolean) // ["admin", "events", "ev_001", "edit"]
  const crumbs = []
  let path = ""

  for (let i = 0; i < parts.length; i++) {
    const part  = parts[i]
    path        += "/" + part
    const label = LABELS[part] ?? (part.length > 20 ? part.slice(0, 12) + "…" : part)

    crumbs.push({
      label,
      href:   path,
      isLast: i === parts.length - 1,
      // Ẩn UUIDs/IDs dài (slug ngắn vẫn hiện)
      isId:   !LABELS[part] && (part.includes("-") && part.length > 15),
    })
  }

  // Bỏ "admin" ở đầu nếu không phải trang cuối
  if (crumbs.length > 1 && crumbs[0]?.label === "Dashboard") {
    crumbs.shift()
  }

  return crumbs
}

// ─── Avatar ──────────────────────────────────────────────────
function Avatar({ name, src }) {
  if (src) {
    return <img src={src} alt={name} className="w-7 h-7 rounded-full object-cover ring-2 ring-sidebar-border" />
  }
  const initial = (name ?? "A")[0].toUpperCase()
  return (
    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center ring-2 ring-primary/20">
      <span className="text-white text-xs font-semibold">{initial}</span>
    </div>
  )
}

// ─── Main Header ─────────────────────────────────────────────
export function AdminHeader({ onMenuClick }) {
  const { data: session } = useSession()
  const pathname          = usePathname()
  const crumbs            = buildCrumbs(pathname)

  return (
    <header className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-20">

      {/* Left: mobile menu + breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger (mobile only) */}
        <button
          onClick={onMenuClick}
          className="md:hidden text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight size={13} className="text-muted-foreground/40 shrink-0" />}
              {crumb.isLast ? (
                <span className="font-semibold text-foreground truncate max-w-[200px]">
                  {crumb.label}
                </span>
              ) : (
                <span className="text-muted-foreground truncate max-w-[120px] hover:text-foreground transition-colors cursor-default">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right: user info */}
      {session?.user && (
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-medium text-foreground leading-tight">
              {session.user.name}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {session.user.email}
            </span>
          </div>
          <Avatar name={session.user.name} src={session.user.avatar} />
        </div>
      )}
    </header>
  )
}