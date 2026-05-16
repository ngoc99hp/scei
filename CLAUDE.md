# CLAUDE.md — SCEI Startup Portal

## Tổng quan dự án
Cổng thông tin Trung tâm Khởi nghiệp và Đổi mới Sáng tạo (SCEI) — quản lý chương trình, startup, mentor, sự kiện, bài viết, tài liệu.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router | ^16.1.6 |
| React | React | 19.2.3 |
| Language | JavaScript (JSX) — không dùng TypeScript | — |
| Styling | Tailwind CSS v4 + CSS Variables (OKLch) | ^4 |
| Database | PostgreSQL via Neon serverless | ^1.0.2 |
| Auth | NextAuth.js (JWT + CredentialsProvider) | ^4.24.13 |
| Forms | React Hook Form + Zod | ^7.69.0 / ^4.3.6 |
| Rich Text | Tiptap | ^3.20.1 |
| Upload | Cloudinary | ^2.9.0 |
| Cache/Rate Limit | Upstash Redis (fallback: in-memory) | ^1.36.3 |
| Icons | lucide-react | ^0.562.0 |
| Dark Mode | next-themes | ^0.4.6 |
| Font | Inter (next/font, subsets: latin + vietnamese) | — |

## Cấu trúc thư mục

```
src/
├── app/
│   ├── (public)/        # Trang public — không cần auth
│   │   ├── page.js      # Homepage
│   │   ├── about/
│   │   ├── programs/[slug]/
│   │   ├── startups/[slug]/
│   │   ├── mentors/[slug]/
│   │   ├── events/[slug]/
│   │   ├── news/[slug]/
│   │   ├── resources/[slug]/
│   │   └── contact/
│   ├── (admin)/admin/   # Admin CRUD — yêu cầu auth
│   │   ├── login/
│   │   ├── programs/, startups/, mentors/
│   │   ├── events/, articles/, resources/
│   │   ├── applications/, registrations/
│   │   ├── contacts/, users/, settings/
│   └── api/             # Route handlers
│       ├── auth/[...nextauth]/
│       ├── contact/, programs/[id]/apply/
│       ├── events/[id]/register/
│       └── admin/**     # CRUD + upload
├── components/
│   ├── ui/              # 17 shadcn-style components
│   ├── admin/           # Admin-specific (editor, upload, shell)
│   ├── forms/           # Form components
│   ├── events/          # Calendar, filter, search
│   └── seo/             # JSON-LD structured data
├── lib/
│   ├── db.js            # Neon singleton client
│   ├── auth.js / auth.config.js
│   ├── cloudinary.js
│   ├── validations.js   # Zod schemas
│   ├── sanitize.js      # HTML sanitization
│   ├── rate-limit.js    # Redis / in-memory fallback
│   ├── constants.js     # Status/type label maps
│   └── queries/         # Raw SQL functions per entity
└── hooks/use-debounce.js
```

## Quy tắc code

### JavaScript
- **Không dùng TypeScript** — chỉ `.js` và `.jsx`
- Path alias: `@/` → `src/` (jsconfig.json)
- Import luôn dùng alias: `import { cn } from "@/lib/utils"`
- Không dùng `default export` cho các component UI nhỏ — dùng named export

### Server vs Client Components
- **Mặc định Server Component** trong App Router
- Chỉ thêm `"use client"` khi cần: event handlers, hooks, browser API
- Không fetch data trong Client Components — fetch ở Server Component rồi truyền props

### Database — Raw SQL với Neon
- **Không dùng Prisma/Drizzle** — raw SQL với tagged template literals
- Neon client tự escape params: ``sql`SELECT * FROM x WHERE id = ${id}` ``
- Singleton pattern trong `src/lib/db.js` — không tạo connection mới
- Query functions đặt trong `src/lib/queries/[entity].js`

### API Routes
- Response format chuẩn:
  - Success: `{ ok: true, data: ... }` hoặc `Response.json({ ok: true })`
  - Error: `{ ok: false, error: "message" }` với HTTP 4xx/5xx
- Admin routes: gọi `requireApiAdmin()` từ `src/lib/auth.js` ở đầu handler
- Public POST routes: áp dụng rate limiting từ `src/lib/rate-limit.js`
- Sanitize input HTML với `src/lib/sanitize.js` trước khi lưu DB

### Auth
- Admin login: `/admin/login` — CredentialsProvider, JWT 8 giờ
- Server Component guard: `requireAuth()` từ `src/lib/auth.js`
- API guard: `requireApiAuth()` / `requireApiAdmin()`
- Password hash: bcryptjs — không lưu plaintext

### Styling & Design System
- **Tailwind CSS v4** — không có `tailwind.config.js`, cấu hình trong `globals.css` via `@theme`
- CSS Variables dùng **OKLch** color model (`:root` light, `.dark` dark mode)
- Dark mode: class-based qua `next-themes` — ThemeProvider ở root layout
- Class composition: `cn()` từ `@/lib/utils` (clsx + tailwind-merge)
- Component variants: `class-variance-authority` (cva)
- Không inline style="" trực tiếp — dùng Tailwind hoặc CSS variables

### UI Components (`src/components/ui/`)
- Shadcn/ui-style — custom, không phải package
- Không cài thêm component library (MUI, Ant Design, Chakra...)
- Thêm component mới: tạo file trong `src/components/ui/`, dùng `cva` cho variants
- Icons: **chỉ dùng lucide-react** — không dùng react-icons, heroicons

### Forms
- React Hook Form + Zod resolver
- Zod schemas định nghĩa tập trung trong `src/lib/validations.js`
- Form components đặt trong `src/components/forms/`

### Rich Text Editor
- **Tiptap** cho admin editor (`src/components/admin/rich-text-editor.jsx`)
- Render HTML output: `src/components/rich-text-renderer.jsx`
- Styling rich text: `@tailwindcss/typography` (`prose` class)

### Images & Upload
- **Next.js `<Image>`** component cho tất cả ảnh — không dùng `<img>` thường
- Upload lên **Cloudinary** qua `src/lib/cloudinary.js`
- Folder structure: `scei/{mentors,startups,programs,events,articles,resources}`
- Kích thước chuẩn: avatar 400×400, logo 200×200, cover 1200×675 (16:9)
- Remote patterns được phép: `res.cloudinary.com`, `images.unsplash.com`, `i.pravatar.cc`

### SEO
- Metadata định nghĩa trong mỗi `page.js` qua `export const metadata`
- Structured data (JSON-LD): `src/components/seo/json-ld.jsx`
- Sitemap: `src/app/sitemap.js`, Robots: `src/app/robots.js`
- Admin routes: noindex, nofollow

## Environment Variables bắt buộc

```
DATABASE_URL          # Neon pooled connection
DIRECT_URL            # Neon direct (migrations)
NEXTAUTH_SECRET       # JWT signing key
NEXTAUTH_URL          # Auth callback URL
CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET
UPSTASH_REDIS_REST_URL / REST_TOKEN
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SITE_NAME
```

## Scripts

```bash
npm run dev      # Dev server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint (nếu cấu hình)
```

## Entities chính

`programs` | `startups` | `mentors` | `events` | `articles` | `resources` | `users` | `applications` | `event_registrations` | `contacts`

## Lưu ý quan trọng

- **Không dùng TypeScript** — PR nào thêm `.ts`/`.tsx` sẽ bị reject
- **Không dùng ORM** — chỉ raw SQL với Neon tagged templates
- **Rate limit** mọi public POST API
- **Sanitize HTML** trước khi lưu DB (dùng `src/lib/sanitize.js`)
- **Session max 8 giờ** — không thay đổi nếu không có yêu cầu bảo mật rõ ràng
- Không commit `.env.local` — chỉ commit `.env.example`
- Tuyệt đối không commit git