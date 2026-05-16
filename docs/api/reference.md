# API Reference

Tổng hợp toàn bộ route handler trong `src/app/api/`. Mọi endpoint trả JSON trừ CSV export.

## Helper

| Helper | File | Trả về | Ghi chú |
|--------|------|--------|---------|
| `requireApiAdmin()` | `src/lib/auth.js` | `{ ok: true, session }` hoặc `{ ok: false, res }` | 401 nếu thiếu session, 403 nếu role ≠ ADMIN |
| `requireApiAuth()` | `src/lib/auth.js` | `{ authorized, session/response }` | Chỉ check session, không check role |
| `rateLimit(key)` | `src/lib/rate-limit.js` | `{ ok, remaining, reset }` | Sliding window 10 req/60s, fallback in-memory nếu Redis lỗi (fail open) |
| `sanitizeHtml(html)` | `src/lib/sanitize.js` | string | Allowlist sanitizer cho rich-text |

## Public route

### `GET /api/health`
- **Auth:** Public
- **DB:** Ping Neon (timeout 5s) + Upstash Redis (skip nếu env không có)
- **Response:** `{ status: "ok" | "degraded", timestamp, responseMs, version, environment, checks: { db, redis } }`
- **Status code:** 200 nếu pass, 503 nếu ≥1 check fail
- **Cache:** `Cache-Control: no-store`

### `POST /api/contact`
- **Auth:** Public (rate-limit qua proxy)
- **Body Zod:** `contactSchema` — `{ fullName, organization?, email, phone, subject (enum hop-tac/uom-tao/ho-tro/khac), message, website (honeypot) }`
- **DB:** Check trùng (cùng email + subject trong 1h) → INSERT `contacts`
- **Honeypot:** Nếu `website` không rỗng → trả `{ success: true }` (silent block)
- **Response:** 201 `{ success, message }` hoặc 422 `{ error, fields }`
- **⚠️ Bug:** Duplicate-suppression trả 429 — sai ngữ nghĩa, nên dùng 200 silent hoặc 409 — xem [Bug #15](../plans/bug-fixes.md)

### `POST /api/programs/[id]/apply`
- **Auth:** Public (rate-limit qua proxy)
- **Body Zod:** `applicationSchema` — `{ applicantName, applicantEmail, applicantPhone, startupName, startupWebsite?, startupDesc (50-2000), teamSize (1-100), industry, stage (IDEA|MVP|SEED|SERIES_A|GROWTH|SCALE), fundingRaised?, pitchDeckUrl?, additionalInfo?, website (honeypot) }`
- **DB:**
  1. SELECT program — phải `is_published` + `status = OPEN` + chưa quá `apply_deadline` + chưa đầy `max_applicants`
  2. SELECT application — không cho trùng email với cùng program
  3. INSERT `applications` status=PENDING
- **Response:** 201 `{ success, message }` hoặc 400/404/409
- **⚠️ Bug:** `additionalInfo` không sanitize HTML — admin review có thể bị XSS nếu render dangerouslySetInnerHTML — xem [Bug #17](../plans/bug-fixes.md)

### `POST /api/events/[id]/register`
- **Auth:** Public (rate-limit qua proxy)
- **Body Zod:** `eventRegistrationSchema` — `{ name, email, phone?, organization?, note? }`
- **DB:** Delegate `registerForEvent(id, body)` query function — atomic transaction: kiểm event + deadline + capacity, check trùng, INSERT, increment `registered_count`
- **Response:** 201 `{ success, message }` hoặc 400/404/422 (httpStatus từ query result)

### `GET|POST /api/auth/[...nextauth]`
- Re-export handler từ `authOptions` (`src/lib/auth.config.js`)
- Cung cấp endpoints session, sign-in, sign-out, callback của NextAuth

## Admin route

Mọi route dưới `/api/admin/**` yêu cầu `requireApiAdmin()` đầu handler. Pagination default 20/page (registrations 50/page).

### Programs

| Method | Path | Body | Trả |
|--------|------|------|-----|
| `GET` | `/api/admin/programs?page&status&q` | — | `{ programs, total, totalPages, page }` |
| `POST` | `/api/admin/programs` | `programSchema` | 201 `{ success, program: { id, slug } }` / 422 (slug đã tồn tại) |
| `GET` | `/api/admin/programs/[id]` | — | `{ program }` / 404 |
| `PATCH` | `/api/admin/programs/[id]` | `programSchema` | `{ success: true }` + xóa cover_image cũ trên Cloudinary nếu đổi |
| `DELETE` | `/api/admin/programs/[id]` | — | `{ success: true }` + xóa cover_image trên Cloudinary |

**Side effect:** Cloudinary `deleteImage()` chạy async, error catch silent.

### Startups

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/admin/startups?page&status&q` | List partial column |
| `POST` | `/api/admin/startups` | `startupSchema`; check slug uniqueness |
| `GET` | `/api/admin/startups/[id]` | Full record |
| `PATCH` | `/api/admin/startups/[id]` | UPDATE + xóa `cover_image` & `logo` cũ nếu đổi + invalidate cache stats |
| `DELETE` | `/api/admin/startups/[id]` | DELETE + xóa Cloudinary + invalidate cache |

**⚠️ Bug:** [Bug #2](../plans/bug-fixes.md) (`|| null` / `?? null` cho text NOT NULL), [Bug #1](../plans/bug-fixes.md) (`funding_raised` type mismatch).

### Mentors

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/admin/mentors?page&status&q` | Order: display_order ASC, created_at DESC |
| `POST` | `/api/admin/mentors` | `mentorSchema` |
| `GET` | `/api/admin/mentors/[id]` | Full |
| `PATCH` | `/api/admin/mentors/[id]` | UPDATE + xóa avatar cũ nếu đổi |
| `DELETE` | `/api/admin/mentors/[id]` | DELETE + xóa avatar |

**⚠️ Bug:** [Bug #3](../plans/bug-fixes.md) (NOT NULL violation tiềm tàng).

### Events

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/admin/events?page&status&q` | Order start_date DESC |
| `POST` | `/api/admin/events` | `eventSchema` (`startDate` required, datetime-local format) |
| `GET` | `/api/admin/events/[id]` | Full |
| `PATCH` | `/api/admin/events/[id]` | UPDATE + xóa cover_image cũ nếu đổi |
| `DELETE` | `/api/admin/events/[id]` | DELETE cascade `event_registrations`, `event_mentors`, `event_startups` + xóa cover_image Cloudinary |

**⚠️ Bug:** [Bug #4](../plans/bug-fixes.md), [Bug #10](../plans/bug-fixes.md), [Bug #13](../plans/bug-fixes.md) (XSS).

### Articles

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/admin/articles?page&status&q` | Order updated_at DESC |
| `POST` | `/api/admin/articles` | `articleSchema`; **sanitizeHtml(content)** trước insert; set `published_at` nếu status=PUBLISHED |
| `GET` | `/api/admin/articles/[id]` | Full (content as-is, unsafe — render phải sanitize ở client) |
| `PATCH` | `/api/admin/articles/[id]` | **sanitizeHtml(content)**; check slug duy nhất trừ self; set `published_at` lần đầu PUBLISH |
| `DELETE` | `/api/admin/articles/[id]` | DELETE + xóa cover_image |

Entity DUY NHẤT có sanitize HTML đúng spec.

### Resources

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/admin/resources?page&type&q` | Order created_at DESC |
| `POST` | `/api/admin/resources` | `resourceSchema` (`.refine` ép có `fileUrl` HOẶC `externalUrl`) |
| `GET` | `/api/admin/resources/[id]` | Full |
| `PATCH` | `/api/admin/resources/[id]` | UPDATE + xóa cover_image cũ |
| `DELETE` | `/api/admin/resources/[id]` | DELETE + xóa cover_image |

### Applications (review)

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/admin/applications?page&status&program_id&q` | LEFT JOIN programs (show program_name) |
| `GET` | `/api/admin/applications/[id]` | Full + program_name |
| `PATCH` | `/api/admin/applications/[id]` | `reviewApplicationSchema` — `{ status (REVIEWING|APPROVED|REJECTED|WAITLISTED), reviewNote? }`. Set `reviewed_at = now()` |

(Application không cho POST/DELETE qua admin API — chỉ public POST `/api/programs/[id]/apply`.)

### Contacts

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/admin/contacts?page&status&q` | List partial column |
| `GET` | `/api/admin/contacts/[id]` | Full |
| `PATCH` | `/api/admin/contacts/[id]` | `{ status (NEW|READING|REPLIED|IGNORED), admin_note? }`. Set `replied_at` nếu status=REPLIED |
| `DELETE` | `/api/admin/contacts/[id]` | DELETE |

### Registrations

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/admin/registrations?page&event_id&q&format` | List JSON 50/page; nếu `format=csv` → `text/csv` với UTF-8 BOM cho Excel mở đúng tiếng Việt; cột: name, email, phone, organization, note, created_at (format vi-VN), event title |

### Users

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/admin/users` | List partial column (không có password_hash) |
| `POST` | `/api/admin/users` | `createUserSchema` — `{ email, name?, password (≥8) }`. Check email duy nhất case-insensitive; bcrypt salt 12; INSERT is_active=true |
| `PATCH` | `/api/admin/users/[id]` | `patchUserSchema` — `{ name?, is_active?, password? }`. Separate UPDATE từng field; hash password nếu có |

(Không có DELETE — chỉ disable qua `is_active`.)

### Upload

| Method | Path | Ghi chú |
|--------|------|---------|
| `POST` | `/api/admin/upload` | `multipart/form-data`: `file` (≤5MB, image/jpeg|png|webp|gif), `type` (folder), `slug` (filename). Magic-byte check. Cloudinary upload với size theo type. Response: `{ ok, url, publicId, width, height }` |

### Settings

| Method | Path | Ghi chú |
|--------|------|---------|
| `GET` | `/api/admin/settings` | Trả `{ config: { key: { value, label }, ... } }` |
| `PATCH` | `/api/admin/settings` | `patchSettingsSchema` — free-form record `{ key: value }`. Parallel UPSERT (INSERT ON CONFLICT) cho từng cặp key-value |

## Format chuẩn

### Success
```json
// Single resource
{ "success": true, "program": { "id": "...", "slug": "..." } }

// Boolean
{ "success": true }

// List
{ "programs": [...], "total": 50, "totalPages": 3, "page": 1 }
```

### Error
```json
// Validation
{ "error": "Dữ liệu không hợp lệ", "details": { "fieldName": ["error msg"] } }    // 422

// Auth
{ "error": "Không có quyền" }                                                       // 401/403

// Not found
{ "error": "Không tìm thấy" }                                                       // 404

// Server
{ "error": "Lỗi server" }                                                           // 500 (kèm logger.error)
```

## Rate limiting

`src/proxy.js` áp dụng `rateLimit()` cho các path:
- `/api/contact/*`
- `/api/events/:path*`
- `/api/programs/:path*`

Limit: **10 request / 60 giây** theo IP (sliding window). Trả 429 nếu vượt.

**⚠️ Vấn đề tiềm tàng:** Matcher cover cả GET, không chỉ POST → các route GET trong tương lai sẽ share window với POST. Xem [Bug #11](../plans/bug-fixes.md). Logic Redis incr-result coercion cũng cần kiểm tra — xem [Bug #12](../plans/bug-fixes.md).

## Authorization layers

| Layer | File | Bảo vệ |
|-------|------|--------|
| Middleware | `src/proxy.js` | Redirect `/admin/*` về `/admin/login` nếu chưa đăng nhập |
| Server component | `src/lib/auth.js` `requireAuth()` | Redirect khi render server-side |
| API route | `src/lib/auth.js` `requireApiAdmin()` | Trả 401/403 trên handler |

3 lớp đều có — defense in depth. Tuy nhiên proxy đang **chỉ check `!!token`**, không check role → [Bug #14](../plans/bug-fixes.md).
