# Trang Admin

Toàn bộ route admin nằm trong `src/app/(admin)/admin/`. Layout `AdminShell` wrap mọi page (sidebar + header sticky + main scroll). Auth bắt buộc qua NextAuth — `src/proxy.js` redirect về `/admin/login` nếu chưa đăng nhập.

## Layout & shell

| File | Vai trò |
|------|---------|
| `src/app/(admin)/admin/layout.js` | Wrap `<AdminShell>` + `<SessionProvider>` + meta `robots: { index: false }` |
| `src/components/admin/admin-shell.jsx` | Desktop sidebar collapsible (lưu state vào localStorage), Mobile drawer, sticky header |
| `src/components/admin/admin-sidebar.jsx` | 4 nhóm nav: Tổng quan / Nội dung / Tương tác / Hệ thống. Active indicator + tooltip khi collapsed + logout đỏ |
| `src/components/admin/admin-header.jsx` | Breadcrumb từ pathname (ẩn ID), user avatar + name + email, hamburger mobile |

## Login

| Route | File | Mô tả |
|-------|------|-------|
| `/admin/login` | `src/app/(admin)/admin/login/page.js` | NextAuth credentials (email + password). Error tiếng Việt. Toggle hiện password. Redirect `/admin` nếu thành công. |

## Map route admin

### `/admin` — Dashboard

- **File:** `src/app/(admin)/admin/page.js`
- **UI:** 8 stat card (grid 2-4 col), 4 quick-action button, 3-column activity feed
- **Query:** `SELECT COUNT(*)` 8 table (events, programs, registrations, applications, contacts, articles, resources, startups) + recent data (LIMIT 5-6) cho registrations/applications/contacts
- **Notable:** Greeting theo giờ, alert badge cho item đang pending

### `/admin/programs`
- **List:** `/admin/programs` — table: Name | Type | Status | Apply Deadline | Actions
  - **API:** `GET /api/admin/programs?page=...&q=...&status=...`, `DELETE /api/admin/programs/{id}`
  - **Filter:** Status (OPEN, DRAFT, CLOSED, COMPLETED)
- **Create / Edit:** `/admin/programs/new`, `/admin/programs/[id]/edit`
  - **File:** `src/app/(admin)/admin/programs/[id]/edit/page.js`
  - **API:** `POST /api/admin/programs` (new), `PATCH /api/admin/programs/{id}`, `GET /api/admin/programs/{id}` (load)
  - **Form fields:** `name` (auto-slug), `slug`, `type`, `status`, `shortDesc` (textarea 300), `description`, `content` (RichTextEditor), `coverImage` (ImageUpload 1200×675), `benefits[]`, `requirements[]` (dynamic ArrayField add/remove), `startDate`, `endDate`, `applyDeadline`, `maxApplicants`, `tags`, `isPublished`, `isFeatured`, `displayOrder`

### `/admin/startups`
- **List:** table: Name + Logo | Industry | Status | Actions
  - **Filter:** Status (INCUBATING, ACCELERATING, GRADUATED, INACTIVE)
- **Form:** `name`, `slug`, `logo` (ImageUpload type=startup 800×600), `tagline`, `description`, `website`, `industry`, `stage`, `status`, `foundedYear`, `teamSize`, `fundingRaised`, `coverImage`, `founderName`, `founderEmail`, `founderLinkedin`, `linkedinUrl`, `facebookUrl`, `tags`, `isPublished`, `isFeatured`, `displayOrder`
- **⚠️ Bug:** `fundingRaised` admin gửi string nhưng public render dạng number — xem [Bug #1](../plans/bug-fixes.md)

### `/admin/mentors`
- **List:** table: Name + Avatar | Organization | Status | Actions
  - **Filter:** Status (ACTIVE, INACTIVE)
- **Form:** `name`, `slug`, `avatar` (ImageUpload type=mentor 400×400), `title`, `organization`, `bio`, `shortBio` (300), `email`, `linkedinUrl`, `facebookUrl`, `website`, `expertise` (input text comma-separated), `yearsExp`, `tags`, `status`, `isPublished`, `isFeatured`, `displayOrder`
- **⚠️ Bug:** `expertise` lưu string nhưng public render array — xem [Bug #7](../plans/bug-fixes.md)

### `/admin/events`
- **List:** table: Title | Type | Status | Registrations | Actions
  - **Filter:** Status (OPEN, ONGOING, DRAFT, COMPLETED, CANCELLED)
- **Form:** `title`, `slug`, `type`, `status`, `shortDesc`, `description`, `content` (RichTextEditor), `coverImage`, `startDate` (datetime-local, required), `endDate`, `registerDeadline`, `isOnline`, `location`, `onlineLink`, `maxAttendees`, `tags`, `isPublished`, `isFeatured`
- **⚠️ Bug:** Form gửi `null` cho date trống nhưng Zod expect string — xem [Bug #10](../plans/bug-fixes.md). Content KHÔNG sanitize XSS — xem [Bug #13](../plans/bug-fixes.md).

### `/admin/articles`
- **List:** table: Title | Category | Status | Published Date | Actions
  - **Filter:** Status (DRAFT, PUBLISHED, ARCHIVED)
- **Form:** `title` (auto-slug), `slug`, `excerpt`, `content` (RichTextEditor + sanitize ở server), `coverImage`, `status`, `category` (select 7 predefined), `tags`, `metaTitle`, `metaDesc`
- **Notable:** Là entity DUY NHẤT sanitize HTML ở server (`articles/route.js` import `sanitizeHtml`)

### `/admin/resources`
- **List:** table: Title | Type | Category | Downloads | Actions
  - **Filter:** Type (DOCUMENT, VIDEO, TEMPLATE, GUIDE, TOOL)
- **Form:** `title`, `slug`, `type`, `category`, `description`, `fileUrl` HOẶC `externalUrl` (Zod `.refine` ép phải có 1 trong 2), `coverImage`, `tags`, `isPublished`, `isFeatured`

### `/admin/applications` — Review hồ sơ
- **File:** `src/app/(admin)/admin/applications/page.js`
- **API:** `GET /api/admin/applications`, `PATCH /api/admin/applications/{id}` (inline status dropdown)
- **Filter:** Status (PENDING, REVIEWING, APPROVED, REJECTED, WAITLISTED)
- **Table:** Startup Name | Applicant | Status (dropdown) | Date | Actions
- **Note:** Status transition trực tiếp trong table, không có trang edit riêng

### `/admin/registrations` — Đăng ký sự kiện
- **API:** `GET /api/admin/registrations?...&format=csv?` (CSV export khi format=csv)
- **Filter:** Event selector (dropdown động)
- **Table:** Name | Email | Organization | Event | Registration Date
- **Notable:** Nút "Export CSV" với UTF-8 BOM cho Excel mở đúng tiếng Việt

### `/admin/contacts`
- **API:** `GET /api/admin/contacts`, `PATCH /api/admin/contacts/{id}` (status + note), `DELETE`
- **Filter:** Status (NEW, READING, REPLIED, CLOSED)
- **Notable:** Modal detail mở rộng (xem full message + note field), state machine NEW → READING → REPLIED → CLOSED

### `/admin/users`
- **API:** `GET / POST / PATCH (password) / DELETE /api/admin/users[/{id}]`
- **Notable:** Modal tạo user (email, name, password ≥8 char), modal đổi password, hiển thị last_login_at

### `/admin/settings`
- **API:** `GET / PATCH /api/admin/settings`
- **Sections:** General (site name, desc, URL, logo, favicon) → Contact (email, phone, address) → Social (Facebook, LinkedIn, YouTube) → SEO (OG image, keywords, GA)
- **Storage:** Flat key-value trong table `site_configs`, auto-fill missing key bằng default

## Admin UI primitives

Định nghĩa tại `src/components/admin/admin-ui.jsx`.

| Component | Mục đích | Props chính |
|-----------|----------|------------|
| `<PageHeader />` | Title + description + back link + actions | `title`, `description`, `backHref`, `actions` |
| `<CreateButton />` | CTA primary tạo mới | `href`, `label` |
| `<FilterBar />` | Search input + filter pill | `searchValue`, `onSearch`, `filters`, `placeholder`, `extra` |
| `<StatusBadge />` | Badge color theo 14 status | `status` |
| `<PublishBadge />` | Published / Hidden | `published` |
| `<EmptyAdmin />` | State trống | `message`, `action` |
| `<ConfirmDialog />` | Confirm destructive | `open`, `title`, `message`, `danger`, `loading`, `onConfirm`, `onCancel` |
| `<TablePagination />` | Smart page range | `page`, `totalPages`, `onPage` |
| `<FormSection />` | Group field theo section | `title`, `description`, `children` |
| `<Field />` | Label + input wrapper | `label`, `required`, `hint`, `children` |
| `<SaveBar />` | Sticky bottom save (success/error message) | `saving`, `success`, `error`, `onSave`, `extra` |
| `inputCls` | Class string cho input | — |
| `labelCls` | Class string cho label | — |

## RichTextEditor

**File:** `src/components/admin/rich-text-editor.jsx`

- **Tech:** Tiptap v3
- **Extensions:** StarterKit · Link · Underline · Highlight · TextAlign · CharacterCount · Placeholder
- **Toolbar:** Undo/Redo · Heading · Bold/Italic/Underline/Strike/Highlight · Alignment · List · Quote/Code · Link · Find & Replace · Fullscreen
- **Features:** Floating selection toolbar, find & replace bar, character + word count footer, full-screen ESC để thoát
- **Props:** `value`, `onChange (html) => void`, `placeholder`, `minHeight`
- **Lưu ý:** HTML output **chưa sanitize** ở client. Backend bắt buộc sanitize trước khi insert. Hiện chỉ `articles` đang làm đúng — `programs`, `events` chưa ([Bug #13](../plans/bug-fixes.md)).

## ImageUpload

**File:** `src/components/admin/image-upload.jsx`

- **Endpoint:** `POST /api/admin/upload` (multipart/form-data)
- **Form data:** `file` + `type` (mentor|startup|program|event|article|resource|misc) + `slug` (cho filename)
- **Validation client:** Max 5MB, MIME image/jpeg|png|webp|gif
- **Validation server:** Magic byte check (`FF D8 FF` cho JPEG, `89 50 4E 47` cho PNG,…) — chống MIME spoofing
- **Folder Cloudinary:** `scei/{type}` + crop size theo type
  - mentor: 400×400 fill
  - startup: 800×600 fill
  - program / event: 1200×675 fill
- **Features:** Drag-drop + click upload, preview, replace / remove overlay, loading spinner, error toast với retry hint, aspect-ratio template (square / landscape / portrait), default size hint per type
- **Props:** `name`, `value` (URL), `onChange (url) => void`, `type`, `slug`, `label`, `hint`, `aspect`

## Auth guard

- **Middleware:** `src/proxy.js` — `withAuth` từ `next-auth/middleware` cho mọi path `/admin/*` (trừ `/admin/login`)
- **Server component:** `requireAuth()` trong `src/lib/auth.js` — redirect về `/admin/login` nếu chưa đăng nhập
- **API:** `requireApiAdmin()` — trả `{ ok: true, session }` hoặc `{ ok: false, res: Response }` (401 / 403)
- **⚠️ Defense in depth:** Hiện proxy chỉ check `!!token`, không check `token.role === "ADMIN"`. Hôm nay không exploit được vì mọi user verified đều hard-code role ADMIN, nhưng cần fix khi thêm cột role — xem [Bug #14](../plans/bug-fixes.md).
