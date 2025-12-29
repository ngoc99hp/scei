import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold">
            SCEI
          </Link>
          
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/programs" className="text-sm font-medium transition-colors hover:text-primary">
              Chương trình
            </Link>
            <Link href="/startups" className="text-sm font-medium transition-colors hover:text-primary">
              Startups
            </Link>
            <Link href="/mentors" className="text-sm font-medium transition-colors hover:text-primary">
              Mentors
            </Link>
            <Link href="/events" className="text-sm font-medium transition-colors hover:text-primary">
              Sự kiện
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              Về chúng tôi
            </Link>
            <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
              Liên hệ
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/admin" 
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Admin
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold">SCEI</h3>
              <p className="text-sm text-muted-foreground">
                Trung tâm Khởi nghiệp Đổi mới Sáng tạo
              </p>
            </div>
            
            <div>
              <h4 className="mb-4 text-sm font-semibold">Chương trình</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/programs" className="hover:text-foreground">Incubation</Link></li>
                <li><Link href="/programs" className="hover:text-foreground">Acceleration</Link></li>
                <li><Link href="/programs" className="hover:text-foreground">Co-working</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold">Tài nguyên</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/resources" className="hover:text-foreground">Tài liệu</Link></li>
                <li><Link href="/news" className="hover:text-foreground">Tin tức</Link></li>
                <li><Link href="/events" className="hover:text-foreground">Sự kiện</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-semibold">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Email: info@scei.vn</li>
                <li>Phone: +84 xxx xxx xxx</li>
                <li><Link href="/contact" className="hover:text-foreground">Form liên hệ</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SCEI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}