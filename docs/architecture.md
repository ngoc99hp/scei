# Kiến trúc & Convention

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js App Router (Turbopack) | ^16.1.6 |
| React | React | 19.2.3 |
| Language | JavaScript / JSX — **không TypeScript** | — |
| Styling | Tailwind CSS v4 + CSS Variables (OKLch) | ^4 |
| Database | PostgreSQL (Neon serverless) | ^1.0.2 |
| Auth | NextAuth.js (JWT, CredentialsProvider, 8h) | ^4.24.13 |
| Forms | React Hook Form + Zod | ^7.69.0 / ^4.3.6 |
| Rich Text | Tiptap (StarterKit, Link, Underline, Highlight, TextAlign, CharacterCount, Placeholder) | ^3.20.1 |
| Upload | Cloudinary | ^2.9.0 |
| Cache / Rate Limit | Upstash Redis (fallback in-memory) | ^1.36.3 |
| Icons | lucide-react | ^0.562.0 |
| Dark Mode | next-themes (class-based) | ^0.4.6 |
| Password hash | bcryptjs | ^2.4.3 |
| Font | Inter (subsets latin + vietnamese) | — |

Dev deps: `@tailwindcss/postcss`, `tailwindcss`, `tw-animate-css`.

## Folder Structure

```
src/
├── app/
│   ├── (public)/                 # Trang public, không auth
│   │   ├── layout.js             # Wrap PublicHeader + PublicFooter
│   │   ├── page.js               # Homepage (revalidate 3600s)
│   │   ├── about/page.js
│   │   ├── contact/page.js
│   │   ├── programs/{page.js, [slug]/page.js}
│   │   ├── startups/{page.js, [slug]/page.js}
│   │   ├── mentors/{page.js, [slug]/page.js}
│   │   ├── events/{page.js, [slug]/page.js}
│   │   ├── news/{page.js, [slug]/page.js}
│   │   └── resources/{page.js, [slug]/page.js}
│   ├── (admin)/admin/            # Admin — yêu cầu role ADMIN
│   │   ├── layout.js             # AdminShell + SessionProvider
│   │   ├── login/page.js         # NextAuth credentials
│   │   ├── page.js               # Dashboard
│   │   ├── {programs,startups,mentors,events,articles,resources}/
│   │   │   ├── page.js           # List + filter + search
│   │   │   ├── new/page.js       # → forward đến [id]/edit với id="new"
│   │   │   └── [id]/edit/page.js # CRUD form chung (Create/Edit)
│   │   ├── applications/page.js
│   │   ├── registrations/page.js # + CSV export
│   │   ├── contacts/page.js
│   │   ├── users/page.js
│   │   └── settings/page.js
│   ├── api/
│   │   ├── auth/[...nextauth]/route.js
│   │   ├── health/route.js
│   │   ├── contact/route.js
│   │   ├── programs/[id]/apply/route.js
│   │   ├── events/[id]/register/route.js
│   │   └── admin/**              # CRUD + upload (yêu cầu requireApiAdmin)
│   ├── not-found.js
│   ├── sitemap.js                # Dynamic, revalidate 6h
│   └── robots.js                 # Disallow /admin /api
├── components/
│   ├── ui/                       # 17 component shadcn-style (Card, Button, Badge,…)
│   ├── admin/                    # AdminShell, sidebar, header, admin-ui primitives,
│   │                             # rich-text-editor, image-upload
│   ├── forms/                    # ContactForm, ProgramApplyForm, EventRegisterForm
│   ├── events/                   # CategoryFilter, calendar, …
│   ├── seo/                      # JSON-LD: ProgramJsonLd, EventJsonLd, ArticleJsonLd,
│   │                             # PersonJsonLd, BreadcrumbJsonLd
│   └── rich-text-renderer.jsx    # Render HTML output (prose styling)
├── lib/
│   ├── db.js                     # Neon singleton (default export sql)
│   ├── auth.js                   # requireAuth, requireApiAuth, requireApiAdmin
│   ├── auth.config.js            # NextAuth options (JWT 8h)
│   ├── cloudinary.js             # upload, deleteImage, extractPublicId
│   ├── validations.js            # Toàn bộ Zod schemas
│   ├── sanitize.js               # HTML allowlist sanitizer
│   ├── rate-limit.js             # Upstash hoặc in-memory fallback
│   ├── constants.js              # Label maps cho enum (PROGRAM_TYPE_LABEL,…)
│   ├── generate-static-params.js # Helper cho SSG
│   ├── pagination.js
│   ├── page-config.js
│   ├── logger.js
│   ├── utils.js                  # cn() = clsx + tailwind-merge
│   ├── queries/
│   │   ├── programs.js
│   │   ├── startups.js
│   │   ├── mentors.js
│   │   ├── events.js
│   │   ├── articles.js
│   │   ├── resources.js
│   │   └── errors.js
│   └── __tests__/sanitize.test.js
├── hooks/use-debounce.js
└── proxy.js                       # Middleware (NextAuth withAuth + rate limit)
```

## Convention code

### Server vs Client component
- Mặc định Server Component
- Chỉ thêm `"use client"` khi cần event handler, React hooks, hoặc browser API
- **Không fetch data trong Client Component** — fetch ở server, truyền props xuống

### Database — raw SQL Neon
- **Không Prisma/Drizzle/Kysely**
- Tagged template literal: `` sql`SELECT * FROM x WHERE id = ${id}` `` — Neon auto-escape
- Singleton `src/lib/db.js`, không tạo connection mới ở nơi khác
- Query function gom trong `src/lib/queries/<entity>.js`
- **Array column (`text[]`):** truyền JS array trực tiếp (`${arr.length ? arr : null}`). **Không** join thành string.
- **NOT NULL text column:** dùng `?? ""` (nullish coalescing) — **không** dùng `|| null`

### API route
- Success: `Response.json({ ok: true, data })` hoặc `{ success: true, ... }`
- Error: `Response.json({ error: "msg" }, { status: 4xx })`
- Admin route: gọi `await requireApiAdmin()` đầu handler, return `auth.res` nếu fail
- Public POST: rate-limit qua `src/proxy.js` (middleware)
- Sanitize HTML qua `src/lib/sanitize.js` **trước khi insert** — hiện chỉ `articles` đang làm đúng, `programs`/`events` chưa (xem [plans/bug-fixes.md → Bug #13](./plans/bug-fixes.md))

### Auth
- Login `/admin/login` — CredentialsProvider, JWT 8 giờ (`maxAge: 8 * 60 * 60`)
- Server Component guard: `requireAuth()`
- API guard: `requireApiAuth()` / `requireApiAdmin()`
- Password: `bcryptjs` (salt 12)
- Hiện tại mọi user đã verified đều được hard-code `role: "ADMIN"` trong `auth.config.js` (vì DB chưa có cột role)

### Styling
- Tailwind v4 — **không có `tailwind.config.js`**, cấu hình trong `globals.css` qua `@theme`
- CSS variables OKLch (`:root` light, `.dark` dark mode)
- Dark mode qua `next-themes` class-based — ThemeProvider ở root layout
- Class composition: `cn()` từ `@/lib/utils`
- Component variants: `class-variance-authority` (cva)
- **Không inline `style=""`** — Tailwind hoặc CSS variables

### UI components
- Shadcn-style custom, **không cài thêm UI library** (MUI, Ant, Chakra,…)
- Thêm component mới: tạo file trong `src/components/ui/`, dùng `cva` cho variants
- **Icons: chỉ `lucide-react`** — không react-icons / heroicons

### Forms
- React Hook Form + Zod resolver
- Schema tập trung trong `src/lib/validations.js`
- Form component trong `src/components/forms/`

### Rich Text
- Tiptap cho admin (`src/components/admin/rich-text-editor.jsx`)
- Render HTML output: `src/components/rich-text-renderer.jsx`
- Style rich text: `@tailwindcss/typography` (`prose` class)

### Image & Upload
- **Bắt buộc `<Image>`** của Next — không `<img>` thường
- Upload Cloudinary qua `src/lib/cloudinary.js`
- Folder structure: `scei/{mentors,startups,programs,events,articles,resources}`
- Kích thước chuẩn: avatar 400×400, logo 200×200, cover 1200×675 (16:9)
- Remote allow-list: `res.cloudinary.com`, `images.unsplash.com`, `i.pravatar.cc`
- Magic-bytes check trong `POST /api/admin/upload` (chống MIME spoofing)

### SEO
- Metadata trong mỗi `page.js` qua `export const metadata` hoặc `generateMetadata()`
- JSON-LD: `src/components/seo/json-ld.jsx`
- `sitemap.js` (revalidate 6h), `robots.js` (disallow /admin, /api, một số query string)
- Admin routes: `robots: { index: false, follow: false }` (set ở layout)

### Logging
- `src/lib/logger.js` — `logger.error / warn / info` với JSON output
- Mọi error 5xx phải `logger.error(msg, err, { context })`

## Environment variables

```dotenv
# Database
DATABASE_URL          # Neon pooled connection string
DIRECT_URL            # Neon direct (cho migration nếu có)

# Auth
NEXTAUTH_SECRET       # JWT signing key (random 32+ char)
NEXTAUTH_URL          # Callback URL, vd http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# Upstash Redis (rate limit + cache)
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Public
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SITE_NAME
```

Không commit `.env.local`. Chỉ commit `.env.example` (template).

## Scripts npm

```bash
npm run dev      # next dev (Turbopack)
npm run build    # next build
npm run start    # next start
```

**Chưa có**: `npm run lint`, `npm run test`. Đề xuất bổ sung — xem [plans/bug-fixes.md → Roadmap test infra](./plans/bug-fixes.md).

## Entities chính (10 table)

`programs` · `startups` · `mentors` · `events` · `articles` · `resources` · `users` · `applications` · `event_registrations` · `contacts` · (+ `site_configs` cho settings)

Chi tiết tại [database/schema.md](./database/schema.md).

## Quy tắc bắt buộc

1. **Không TypeScript** — PR có `.ts`/`.tsx` sẽ bị reject
2. **Không ORM** — chỉ raw SQL Neon tagged template
3. **Rate-limit mọi public POST** (middleware đã cover, không tự thêm trong handler)
4. **Sanitize HTML** trước khi lưu cho mọi field rich-text (`content` của `articles`, `programs`, `events`)
5. **Session 8 giờ** — không thay đổi nếu không có lý do bảo mật cụ thể
6. **Không commit `.env.local`** — chỉ commit `.env.example`
7. **Không commit code lên git** (yêu cầu owner — ghi trong CLAUDE.md)
