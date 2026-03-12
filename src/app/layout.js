// src/app/layout.js
// ✅ FIX — Giữ nguyên ThemeProvider + SessionProvider
// ✅ SEO — metadataBase, default metadata đầy đủ
// ✅ FIX Turbopack — KHÔNG import OrganizationJsonLd component vào root layout.
//    Next.js 16 Turbopack: Server Component import trong root layout
//    mà đọc process.env ở module level → "notFound() is not allowed in root layout".
//    Workaround: inline <script type="application/ld+json"> trực tiếp, không qua component.

import "./globals.css"
import { ThemeProvider }   from "@/components/theme-provider"
import { SessionProvider } from "@/components/session-provider"

const BASE = process.env.NEXT_PUBLIC_SITE_URL

// ── Default Metadata ──────────────────────────────────────────────────────────
export const metadata = {
  // ✅ SEO FIX — metadataBase bắt buộc để Next.js resolve OG image URLs
  metadataBase: new URL(BASE),

  title: {
    default:  "SCEI — Trung tâm Khởi nghiệp Đổi mới Sáng tạo",
    template: "%s | SCEI",
  },

  description:
    "SCEI kết nối startup, nhà đầu tư và mentor — hỗ trợ hệ sinh thái khởi nghiệp đổi mới sáng tạo Việt Nam.",

  keywords: [
    "khởi nghiệp", "startup", "đổi mới sáng tạo", "SCEI",
    "hỗ trợ startup", "mentor", "nhà đầu tư", "incubator", "accelerator",
  ],

  authors:   [{ name: "SCEI", url: BASE }],
  creator:   "SCEI",
  publisher: "SCEI",

  openGraph: {
    type:        "website",
    locale:      "vi_VN",
    url:         BASE,
    siteName:    "SCEI",
    title:       "SCEI — Trung tâm Hỗ trợ Khởi nghiệp",
    description: "Kết nối startup, nhà đầu tư và mentor tại Việt Nam.",
    images: [{
      url:    "/og-default.png",
      width:  1200,
      height: 630,
      alt:    "SCEI — Hệ sinh thái Khởi nghiệp Đổi mới Sáng tạo",
    }],
  },

  twitter: {
    card:        "summary_large_image",
    site:        "@scei_vn",
    title:       "SCEI — Trung tâm Hỗ trợ Khởi nghiệp",
    description: "Kết nối startup, nhà đầu tư và mentor tại Việt Nam.",
    images:      ["/og-default.png"],
  },

  robots: {
    index:    true,
    follow:   true,
    googleBot: {
      index:                 true,
      follow:                true,
      "max-image-preview":   "large",
      "max-snippet":         -1,
      "max-video-preview":   -1,
    },
  },

  alternates: {
    canonical: BASE,
  },

  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
  },
}

// Plain object — không phải component, không có side effects
const orgJsonLd = {
  "@context":    "https://schema.org",
  "@type":       "Organization",
  name:          "SCEI",
  alternateName: "Trung tâm Hỗ trợ Khởi nghiệp Đổi mới Sáng tạo",
  url:           BASE,
  logo:          `${BASE}/logo.png`,
  sameAs: [
    "https://facebook.com/scei.vn",
    "https://linkedin.com/company/scei-vn",
  ],
  contactPoint: {
    "@type":           "ContactPoint",
    telephone:         "+84-28-1234-5678",
    contactType:       "customer service",
    availableLanguage: ["Vietnamese", "English"],
  },
}

export default function RootLayout({ children }) {
  return (
    // suppressHydrationWarning cần thiết cho next-themes (dark mode)
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>

        {/*
          Organization JSON-LD — inline trực tiếp, không qua Server Component import.
          Fix cho Next.js 16 Turbopack: import Server Component trong root layout
          có thể trigger "notFound() is not allowed in root layout".
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </body>
    </html>
  )
}