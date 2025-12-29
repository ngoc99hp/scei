"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { name: "Dashboard", href: "/admin" },
  { name: "Programs", href: "/admin/programs" },
  { name: "Applications", href: "/admin/applications" },
  { name: "Startups", href: "/admin/startups" },
  { name: "Mentors", href: "/admin/mentors" },
  { name: "Events", href: "/admin/events" },
  { name: "Articles", href: "/admin/articles" },
  { name: "Resources", href: "/admin/resources" },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-muted/40">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link href="/admin" className="text-xl font-bold">
            SCEI Admin
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-6">
          <div className="text-sm text-muted-foreground">
            Admin Panel
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Về trang chủ
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}