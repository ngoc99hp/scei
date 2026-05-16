# Database Schema

> Dự án **không có Prisma**, **không có file migration SQL**. Toàn bộ schema dưới đây được suy ra từ:
> - Raw SQL trong `src/app/api/admin/**/route.js` (INSERT / UPDATE / SELECT)
> - Query function trong `src/lib/queries/*.js`
> - Zod schema trong `src/lib/validations.js` (cho enum value và string length)
> - Label map trong `src/lib/constants.js`
>
> Vì không có nguồn schema chính thức, đây là **best-effort reverse-engineering** — kiểu một số cột (`uuid` vs `bigint`, `timestamp` vs `timestamptz`, nullability của text optional) có thể không khớp 100% với database thực tế. **Đề xuất:** xuất `pg_dump --schema-only` từ Neon và commit vào `db/schema.sql` để đóng băng nguồn sự thật.

## PostgreSQL ENUM

```sql
CREATE TYPE "ProgramType"       AS ENUM ('INCUBATION', 'ACCELERATION', 'COWORKING');
CREATE TYPE "ProgramStatus"     AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'COMPLETED');
CREATE TYPE "StartupStage"      AS ENUM ('IDEA', 'MVP', 'EARLY', 'GROWTH', 'SCALE');
CREATE TYPE "StartupStatus"     AS ENUM ('INCUBATING', 'ACCELERATING', 'GRADUATED', 'INACTIVE');
CREATE TYPE "EventType"         AS ENUM ('WORKSHOP', 'PITCHING', 'NETWORKING', 'SEMINAR', 'CONFERENCE', 'OTHER');
CREATE TYPE "EventStatus"       AS ENUM ('DRAFT', 'OPEN', 'FULL', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE "MentorStatus"      AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "ArticleStatus"     AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ResourceType"      AS ENUM ('DOCUMENT', 'VIDEO', 'TEMPLATE', 'GUIDE', 'TOOL', 'OTHER');
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'WAITLISTED');
CREATE TYPE "ContactStatus"     AS ENUM ('NEW', 'READING', 'REPLIED', 'IGNORED');
```

**Mâu thuẫn cần làm rõ:** `applicationSchema.stage` enum gồm `SEED`, `SERIES_A` (cho hồ sơ đăng ký) nhưng `startupSchema.stage` enum lại có `EARLY` (cho profile startup). Hai enum khác nhau trong cùng codebase — cần xác nhận trong DB là **1 enum chung** hay **2 enum riêng**.

## Bảng

### `programs`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `slug` | text | NO | — | UNIQUE; regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` |
| `name` | text | NO | — | ≤200 ký tự |
| `type` | "ProgramType" | NO | — | |
| `status` | "ProgramStatus" | NO | — | |
| `short_desc` | text | **NO** *(suy ra)* | `""` | ≤500 |
| `description` | text | **NO** *(đã xác nhận qua bug)* | `""` | |
| `content` | text | **NO** *(suy ra)* | `""` | Rich HTML |
| `benefits` | text[] | YES | NULL | Array of string |
| `requirements` | text[] | YES | NULL | Array of string |
| `cover_image` | text | YES | NULL | Cloudinary URL |
| `start_date` | date | YES | NULL | Form gửi `YYYY-MM-DD` |
| `end_date` | date | YES | NULL | |
| `apply_deadline` | date | YES | NULL | |
| `max_applicants` | int | YES | NULL | NULL = không giới hạn |
| `is_published` | boolean | NO | `false` | |
| `is_featured` | boolean | NO | `false` | Homepage featured |
| `display_order` | int | NO | `0` | |
| `created_at` | timestamptz | NO | `now()` | |
| `updated_at` | timestamptz | NO | `now()` | |

**Index dự kiến:** `UNIQUE (slug)`, `(status)`, `(is_published, is_featured)`.

### `startups`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | PK |
| `slug` | text | NO | UNIQUE |
| `name` | text | NO | ≤200 |
| `logo` | text | YES | URL |
| `tagline` | text | YES | ≤200 |
| `description` | text | likely NO ([Bug #2](../plans/bug-fixes.md)) | |
| `website` | text | YES | URL |
| `industry` | text | likely NO ([Bug #2](../plans/bug-fixes.md)) | ≤100 |
| `stage` | "StartupStage" | NO | |
| `status` | "StartupStatus" | NO | |
| `founded_year` | int | YES | 2000–2030 |
| `team_size` | int | YES | 1–10000 |
| `funding_raised` | **numeric (?)** | YES | ⚠️ Xung đột với Zod string — [Bug #1](../plans/bug-fixes.md) |
| `cover_image` | text | YES | |
| `founder_name` | text | YES | ≤100 |
| `founder_email` | text | YES | |
| `founder_linkedin` | text | YES | |
| `linkedin_url` | text | YES | |
| `facebook_url` | text | YES | |
| `tags` | text[] | NO | `[]` |
| `is_published` | boolean | NO | `false` |
| `is_featured` | boolean | NO | `false` |
| `display_order` | int | NO | `0` |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

**Index:** `UNIQUE (slug)`, `(status)`, `(is_published)`. **Đang được cache (Upstash):** `getStartupStats` lưu vào Redis 5 phút.

### `mentors`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | PK |
| `slug` | text | NO | UNIQUE |
| `name` | text | NO | ≤100 |
| `avatar` | text | YES | URL |
| `title` | text | likely NO | ≤200 |
| `organization` | text | likely NO | ≤200 |
| `expertise` | **text** | YES | ⚠️ Lưu comma-separated string, nhưng UI render dạng array — [Bug #7](../plans/bug-fixes.md) |
| `bio` | text | likely NO | |
| `short_bio` | text | likely NO | ≤300 |
| `email` | text | YES | |
| `linkedin_url` | text | YES | |
| `facebook_url` | text | YES | |
| `website` | text | YES | |
| `years_exp` | int | YES | 0–60 |
| `tags` | text[] | NO | `[]` |
| `status` | "MentorStatus" | NO | `ACTIVE` |
| `is_published` | boolean | NO | `false` |
| `is_featured` | boolean | NO | `false` |
| `display_order` | int | NO | `0` |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

### `events`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | PK |
| `slug` | text | NO | UNIQUE |
| `title` | text | NO | ≤300 |
| `type` | "EventType" | NO | |
| `status` | "EventStatus" | NO | |
| `short_desc` | text | likely NO | ≤500 |
| `description` | text | likely NO | |
| `content` | text | likely NO | Rich HTML — ⚠️ **chưa sanitize** ([Bug #13](../plans/bug-fixes.md)) |
| `cover_image` | text | YES | |
| `start_date` | timestamptz | NO | Form `YYYY-MM-DDTHH:mm` |
| `end_date` | timestamptz | YES | |
| `register_deadline` | timestamptz | YES | |
| `is_online` | boolean | NO | `false` |
| `location` | text | YES | ≤500 |
| `online_link` | text | YES | URL |
| `max_attendees` | int | YES | NULL = không giới hạn |
| `registered_count` | int | NO | `0` — increment realtime |
| `tags` | text[] | NO | `[]` |
| `is_published` | boolean | NO | `false` |
| `is_featured` | boolean | NO | `false` |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

**Index:** `UNIQUE (slug)`, `(status)`, `(start_date DESC)`.

### `articles`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | PK |
| `slug` | text | NO | UNIQUE |
| `title` | text | NO | ≤300 |
| `excerpt` | text | likely NO | ≤500 |
| `content` | text | likely NO | Sanitized HTML (server-side `sanitizeHtml`) |
| `cover_image` | text | YES | |
| `status` | "ArticleStatus" | NO | |
| `category` | text | YES | ≤100 |
| `tags` | text[] | NO | `[]` |
| `meta_title` | text | YES | ≤70 (SEO) |
| `meta_desc` | text | YES | ≤160 (SEO) |
| `view_count` | int | NO | `0` — bot-filtered |
| `published_at` | timestamptz | YES | Set lần đầu khi `status = PUBLISHED` |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

### `resources`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | PK |
| `slug` | text | NO | UNIQUE |
| `title` | text | NO | ≤300 |
| `description` | text | likely NO | ≤2000 |
| `type` | "ResourceType" | NO | |
| `file_url` | text | YES | ≥1 trong (file_url, external_url) — Zod refine |
| `external_url` | text | YES | |
| `cover_image` | text | YES | |
| `category` | text | YES | ≤100 |
| `tags` | text[] | NO | `[]` |
| `download_count` | int | NO | `0` |
| `is_published` | boolean | NO | `false` |
| `is_featured` | boolean | NO | `false` |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

### `applications`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | PK |
| `program_id` | uuid | NO | FK → `programs(id)` ON DELETE CASCADE |
| `applicant_name` | text | NO | ≤100 |
| `applicant_email` | text | NO | |
| `applicant_phone` | text | NO | ≤15 |
| `startup_name` | text | NO | ≤200 |
| `startup_website` | text | YES | URL |
| `startup_desc` | text | NO | 50–2000 |
| `team_size` | int | NO | 1–100 |
| `industry` | text | NO | ≤100 |
| `stage` | "StartupStage" *(hay `ApplicationStage`?)* | NO | ⚠️ Có thể là enum khác — xem ghi chú đầu file |
| `funding_raised` | numeric | YES | |
| `pitch_deck_url` | text | YES | URL |
| `additional_info` | text | YES | ≤1000 — ⚠️ chưa sanitize HTML ([Bug #17](../plans/bug-fixes.md)) |
| `status` | "ApplicationStatus" | NO | `PENDING` |
| `review_note` | text | YES | ≤2000 (admin) |
| `reviewed_at` | timestamptz | YES | |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

**Index:** `(program_id)`, `(applicant_email)`, `(status)`.

### `event_registrations`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | PK |
| `event_id` | uuid | NO | FK → `events(id)` ON DELETE CASCADE |
| `name` | text | NO | ≤100 |
| `email` | text | NO | |
| `phone` | text | YES | ≤15 |
| `organization` | text | YES | ≤200 |
| `note` | text | YES | ≤500 |
| `status` | text | NO | `REGISTERED` |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

**Index:** `(event_id)`, `UNIQUE (event_id, email)` — chống đăng ký trùng cùng event.

### `contacts`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | PK |
| `full_name` | text | NO | ≤100 |
| `organization` | text | YES | ≤200 |
| `email` | text | NO | |
| `phone` | text | NO | ≤15 |
| `subject` | text | NO | `hop-tac` / `uom-tao` / `ho-tro` / `khac` |
| `message` | text | NO | ≤2000 |
| `admin_note` | text | YES | |
| `status` | "ContactStatus" | NO | `NEW` |
| `replied_at` | timestamptz | YES | |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |

**Index:** `(email, subject, created_at)` — phục vụ check trùng 1h.

### `users` (admin)

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `id` | uuid | NO | PK |
| `email` | text | NO | UNIQUE (lowercased) |
| `name` | text | YES | ≤100 |
| `password_hash` | text | NO | bcrypt salt 12 |
| `avatar` | text | YES | |
| `is_active` | boolean | NO | `true` |
| `last_login_at` | timestamptz | YES | |
| `created_at` | timestamptz | NO | `now()` |
| `updated_at` | timestamptz | NO | `now()` |
| `role` *(planned)* | text | — | Hiện chưa có; mọi user verified hard-code `role: "ADMIN"` trong `auth.config.js` |

### `site_configs`

| Column | Type | Nullable | Notes |
|--------|------|----------|-------|
| `key` | text | NO | PK |
| `value` | text | NO | |
| `label` | text | YES | Hiển thị trong admin form |
| `updated_at` | timestamptz | NO | `now()` |

## Foreign-key relationships

```
applications.program_id          → programs.id            (ON DELETE CASCADE)
event_registrations.event_id     → events.id              (ON DELETE CASCADE)
```

Các table khác (mentors, startups, articles, resources, contacts) hiện không có FK đến nhau. `event_mentors`, `event_startups` (junction table) được DELETE trong handler `DELETE /api/admin/events/[id]` nhưng không xuất hiện ở nơi khác — có thể đã được tạo cho future feature nhưng chưa dùng.

## Nullability conventions (đã xác lập sau bug fix)

| Loại field | Cách binding | Default khi rỗng |
|------------|--------------|------------------|
| Text NOT NULL (description, content, short_desc,…) | `${d.field ?? ""}` | `""` (chuỗi rỗng) |
| Text NULLABLE (cover_image, website,…) | `${d.field ?? null}` hoặc `${d.field || null}` | `NULL` |
| `text[]` NULLABLE (benefits, requirements) | `${d.arr?.length ? d.arr : null}` | `NULL` |
| `text[]` NOT NULL DEFAULT '{}' (tags) | `${d.tags ?? []}` | `[]` |
| Date / timestamp | `${d.date ?? null}` (admin), Zod `.string()` không date format | `NULL` |
| Number nullable | `${d.num ?? null}` | `NULL` |

## Đề xuất

1. **Xuất schema chính thức** từ Neon: `pg_dump --schema-only $DATABASE_URL > db/schema.sql`, commit vào repo
2. **Migration tool nhẹ:** dùng `node-pg-migrate` hoặc Atlas-style để có versioning, vẫn giữ raw SQL convention
3. **Index audit:** sau khi có schema.sql, kiểm tra các WHERE clause hot path (slug, status, is_published) đã có index chưa
4. **Enum thống nhất:** kiểm tra `applications.stage` dùng enum nào — nếu vừa `SEED|SERIES_A` (apply) vừa `EARLY` (startup) thì không thể chung; cân nhắc tách `ApplicationStage` riêng
