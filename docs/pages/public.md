# Trang Public

Toàn bộ route public nằm trong `src/app/(public)/`. Layout chung wrap với `<PublicHeader />` + `<PublicFooter />`.

## Layout & file gốc

| File | Vai trò |
|------|---------|
| `src/app/(public)/layout.js` | Wrap header + main + footer |
| `src/app/not-found.js` | 404 page với quick link (home, programs, events, news, contact) |
| `src/app/robots.js` | Disallow `/admin`, `/api`, `/_next`; chặn query string `?page=`, `?category=`, `?sort=`, `?q=` |
| `src/app/sitemap.js` | Dynamic XML sitemap, revalidate 6h, gồm articles published + events + programs + startups + mentors |

## Map route

### `/` — Homepage
- **File:** `src/app/(public)/page.js`
- **Revalidate:** 3600s
- **Data:** Server fetch qua `getPrograms`, `getStartups`, `getStartupStats`, `getMentors`, `getEvents`, `getArticles`
- **Sections:** Hero + CTA → Featured programs (3) → Stats card (chương trình, startup, mentor, vốn raised) → Featured startups (6) → Featured mentors (4) → Featured events (3) → Featured articles (3) → Partner logo strip → About + Values → Testimonials (hardcoded 3) → CTA cuối
- **SEO:** `metadata` title "SCEI — Trung tâm Hỗ trợ Khởi nghiệp Đổi mới Sáng tạo"
- **⚠️ Lỗi đã biết:** Testimonials có `stage: "."` (3 chỗ) render thành badge `.` rỗng nghĩa — xem [Bug #8](../plans/bug-fixes.md). Build cảnh báo `getStartupStats` Redis fetch trong static generation — xem [Bug #9](../plans/bug-fixes.md).

### `/about`
- **File:** `src/app/(public)/about/page.js`
- **Data:** Static (team member, stat hardcode)
- **SEO:** `metadata` title "Về chúng tôi"
- **Sections:** Hero ảnh nền → Mission (2 đoạn) → Stats grid 4 card → Team leadership (3 member)

### `/contact`
- **File:** `src/app/(public)/contact/page.js`
- **Data:** Static header + `<ContactForm />` (client component)
- **SEO:** `metadata` title "Liên hệ — SCEI"
- **Sections:** Tiêu đề + 3 info card (address, phone, email) + form Zod validation + honeypot

### `/programs`
- **File:** `src/app/(public)/programs/page.js`
- **Revalidate:** 3600s
- **Data:** `getPrograms({ page, pageSize })`, `getProgramCount()`
- **Sections:** Hero → Featured (chỉ page 1) → Grid 12/page → CTA cuối
- **Card hiển thị:** cover, type badge, status, benefits (3 đầu), deadline, slot
- **Pagination:** `<PaginationControls />` query `?page=`

### `/programs/[slug]`
- **File:** `src/app/(public)/programs/[slug]/page.js`
- **Revalidate:** 3600s
- **Static params:** `generateStaticParams()`
- **Data:** `getProgramBySlug(slug)`, `getProgramApplicationCount(program.id)`
- **Sections:** Cover → Tên + type + status + short desc → description / content HTML → Requirements → Sidebar (deadline, start date, capacity, ProgramApplyForm) → Benefits
- **SEO:** `generateMetadata()` (title, description, canonical, OG) + `<ProgramJsonLd />` + `<BreadcrumbJsonLd />`

### `/startups`
- **File:** `src/app/(public)/startups/page.js`
- **Revalidate:** 3600s
- **Data:** `getStartups({ page, pageSize })`, `getStartupStats()`, `getStartupCount()`
- **Sections:** Hero → 4 stat card → Featured (chỉ page 1) → Grid 12/page → "Why SCEI" 4 benefit
- **Card hiển thị:** logo, status badge, stage badge, industry, tagline

### `/startups/[slug]`
- **File:** `src/app/(public)/startups/[slug]/page.js`
- **Revalidate:** 3600s
- **Data:** `getStartupBySlug(slug)`
- **Sections:** Logo + tên + stage + status + industry → Cover → Description → Tags → Sidebar (founded year, team size, funding, social link) → Founder name + email
- **SEO:** `generateMetadata()` + `<BreadcrumbJsonLd />`
- **⚠️ Lỗi đã biết:** Render `s.funding_raised.toLocaleString()` và `s.funding_raised > 0` — nhưng admin Zod schema đổi sang `z.string()` → type mismatch. Xem [Bug #1](../plans/bug-fixes.md).

### `/events`
- **File:** `src/app/(public)/events/page.js`
- **Revalidate:** 1800s (30 phút)
- **Data:** `getEvents({ page, pageSize, type })`, `getEventCount({ type })`
- **Sections:** Hero grid pattern → Featured event lớn (page 1) → `<CategoryFilter />` → Upcoming grid filter theo type → Calendar widget → Past events → Empty state
- **Filter:** `?type=` (WORKSHOP/PITCHING/NETWORKING/SEMINAR/CONFERENCE/OTHER)

### `/events/[slug]`
- **File:** `src/app/(public)/events/[slug]/page.js`
- **Revalidate:** 900s (15 phút — vì `registered_count` thay đổi nhanh)
- **Data:** `getEventBySlug(slug)`
- **Sections:** Cover → Tiêu đề + type + status → Description / content HTML qua `<RichTextRenderer />` → Tags → Sidebar (start/end date, location/online link, attendance, deadline) → `<EventRegisterForm />` nếu status === OPEN
- **SEO:** `generateMetadata()` + `<EventJsonLd />` + `<BreadcrumbJsonLd />`

### `/news` (Articles)
- **File:** `src/app/(public)/news/page.js`
- **Revalidate:** 1800s
- **Data:** `getArticles({ limit, offset, category })`, `getArticleCount({ category })`
- **Sections:** Hero → `<NewsCategoryFilter />` → Featured article lớn (page 1) → Grid 12/page
- **Card hiển thị:** cover, category, title, excerpt, date, view count
- **SEO:** `metadata` title "Tin tức & Kiến thức — SCEI"

### `/news/[slug]`
- **File:** `src/app/(public)/news/[slug]/page.js`
- **Revalidate:** 1800s
- **Data:** `getArticleBySlug(slug, userAgent)` (có bot filtering) + `getRelatedArticles(article.id, category, 3)`
- **Sections:** Cover → Tiêu đề + category + date + view count → Content HTML đã sanitize → Tags → Sidebar Related (3)
- **SEO:** `generateMetadata()` + `<ArticleJsonLd />` + `<BreadcrumbJsonLd />`
- **Bot filtering:** Đọc User-Agent header, không tăng view_count nếu là bot (GPTBot, CCBot,…)

### `/mentors`
- **File:** `src/app/(public)/mentors/page.js`
- **Revalidate:** 3600s
- **Data:** `getMentors({ page, pageSize })`, `getMentorCount()`
- **Sections:** Hero → 4 stat card → Featured (page 1) → Grid 12/page → CTA "Join mentor network"
- **Card hiển thị:** avatar (grayscale, hover hiện social), expertise tags, name, title, org, bio, year exp
- **⚠️ Lỗi đã biết:** `expertise` được render như array (`.slice(0,2).map(...)`) nhưng DB lưu là string comma-separated → render rác. Xem [Bug #7](../plans/bug-fixes.md).

### `/mentors/[slug]`
- **File:** `src/app/(public)/mentors/[slug]/page.js`
- **Revalidate:** 3600s
- **Data:** `getMentorBySlug(slug)`
- **Sections:** Sidebar (avatar lớn, name, title, org, year, social links) → Bio + expertise tag + tag
- **SEO:** `generateMetadata()` + `<PersonJsonLd />` + `<BreadcrumbJsonLd />`

### `/resources`
- **File:** `src/app/(public)/resources/page.js`
- **Revalidate:** 3600s
- **Data:** `getResources({ page, pageSize, category })`, `getResourceCount({ category })`
- **Sections:** Hero emerald gradient + tổng số → `<ResourceCategoryFilter />` → Grid 12/page
- **Card hiển thị:** cover, type icon/badge, title, description, featured star, download count, CTA download / view external
- **Filter:** `?type=` (DOCUMENT/VIDEO/TEMPLATE/GUIDE/TOOL/OTHER)

### `/resources/[slug]`
- **File:** `src/app/(public)/resources/[slug]/page.js`
- **Revalidate:** 3600s
- **Data:** `getResourceBySlug(slug)` + `getRelatedResources(resource.id, category, 4)`
- **Sections:** Cover → Title + type badge + featured star + download count → Description + tags → Sidebar CTA (file_url hoặc external_url) + related (4)

## Component chia sẻ (public)

| Component | Vị trí | Mục đích |
|-----------|--------|----------|
| `<Container />`, `<Section />`, `<Card />`, `<Badge />`, `<Button />` | `src/components/ui/` | Primitive shadcn-style |
| `<ContactForm />`, `<ProgramApplyForm />`, `<EventRegisterForm />` | `src/components/forms/` | Form client |
| `<CategoryFilter />`, `<NewsCategoryFilter />`, `<ResourceCategoryFilter />` | `src/components/events/`, `src/components/...` | Filter pill |
| `<PaginationControls />` | `src/components/...` | Phân trang query `?page=` |
| `<ProgramJsonLd />`, `<EventJsonLd />`, `<ArticleJsonLd />`, `<PersonJsonLd />`, `<BreadcrumbJsonLd />` | `src/components/seo/` | JSON-LD structured data |
| `<RichTextRenderer html={...} />` | `src/components/rich-text-renderer.jsx` | Render HTML output (prose) |

## Revalidate strategy

| Route | Revalidate | Lý do |
|-------|-----------|-------|
| `/`, `/programs*`, `/startups*`, `/mentors*`, `/resources*` | 3600s | Nội dung ít thay đổi |
| `/news*` | 1800s | Bài viết mới đăng cần lên nhanh hơn |
| `/events` | 1800s | Filter / list cần fresh |
| `/events/[slug]` | 900s | `registered_count` đổi liên tục khi mở đăng ký |
| `/sitemap.xml` | 6h | Cập nhật entity mới |
