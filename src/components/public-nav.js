"use client"

// src/components/public-nav.js
// Navigation links cho public layout.
// ✅ Thêm "Tin tức" (/news) và "Tài nguyên" (/resources)

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Chương trình", href: "/programs"  },
  { name: "Startups",     href: "/startups"  },
  { name: "Mentors",      href: "/mentors"   },
  { name: "Sự kiện",      href: "/events"    },
  { name: "Tin tức",      href: "/news"      },  // ✅ Thêm mới
  { name: "Tài nguyên",   href: "/resources" },  // ✅ Thêm mới
  { name: "Về chúng tôi", href: "/about"     },
  { name: "Liên hệ",      href: "/contact"   },
]

export function PublicNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden items-center gap-6 md:flex">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors hover:text-primary ${
                isActive ? "font-bold text-primary" : "font-medium text-foreground/60"
              }`}
            >
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* Mobile Navigation Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col p-6 gap-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg transition-colors hover:text-primary py-2 border-b border-border/50 ${
                    isActive ? "font-bold text-primary" : "font-medium text-foreground/60"
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </>
  )
}
