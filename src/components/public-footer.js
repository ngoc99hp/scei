// src/components/public-footer.js
// Footer cho public layout — tách ra từ layout.js để dễ maintain.
// Server Component.

import Link from "next/link"

const footerLinks = {
  "Chương trình": [
    { label: "Incubation", href: "/programs" },
    { label: "Acceleration", href: "/programs" },
    { label: "Co-working", href: "/programs" },
  ],
  "Khám phá": [
    { label: "Startups", href: "/startups" },
    { label: "Mentors", href: "/mentors" },
    { label: "Sự kiện", href: "/events" },
    { label: "Tin tức", href: "/news" },  // ✅ Thêm
    { label: "Tài nguyên", href: "/resources" },  // ✅ Thêm
  ],
  "Liên hệ": [
    { label: "Email: hpu@hpu.edu.vn", href: "mailto:hpu@hpu.edu.vn" },
    { label: "Phone: 0989 320 383", href: "tel:+84989320383" },
    { label: "Form liên hệ", href: "/contact" },
  ],
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">

          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-semibold hover:text-primary transition-colors">
              SCEI
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Trung tâm Khởi nghiệp Đổi mới Sáng tạo — kết nối startup, nhà đầu tư và mentor.
            </p>
            {/* Social links */}
            <div className="mt-4 flex gap-3">
              <a
                href="https://facebook.com/scei.vn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <span className="text-muted-foreground/40">·</span>
              <a
                href="https://linkedin.com/company/scei-vn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                LinkedIn
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} SCEI. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-foreground transition-colors">Về chúng tôi</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">Liên hệ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
