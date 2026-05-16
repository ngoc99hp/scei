# Kế hoạch sửa bug

Audit ngày **2026-05-16**, dựa trên: code snapshot, build output, pattern lỗi đã sửa trong `programs` route gần đây.

## Tóm tắt

| Mức độ | Số lượng | Ý nghĩa |
|--------|----------|---------|
| 🔴 Critical | 1 | Data corruption / crash production |
| 🟠 High | 6 | Tính năng chính lỗi với input thông dụng |
| 🟡 Medium | 6 | Lỗi cụ thể hoặc XSS bề mặt nhỏ |
| 🟢 Low | 6 | Cải thiện chất lượng / không tác động ngay |
| ✓ Verified OK | 11 | Đã verify đúng — ghi chú để tránh quay lại |

**Đề xuất Sprint 1 (hot-fix):** Bug #1, #2, #3, #4, #5, #6, #7, #13. (~1-2 ngày)
**Sprint 2 (security hardening):** Bug #14, #17, #11, #12, #15, #16 → xem [security-hardening.md](./security-hardening.md)
**Sprint 3 (polish):** còn lại

---

## 🔴 Critical

### Bug #1 — `funding_raised` type schism (Zod ≠ DB ≠ render)

- **Vị trí:** `src/lib/validations.js:103` · `src/lib/queries/startups.js` (function `getStartupStats`) · `src/app/(public)/startups/[slug]/page.js:111-114` · `src/app/(public)/page.js:146-149`
- **Triệu chứng:**
  - Hoặc (a) admin save fail khi DB column là `numeric` và nhận `"$200K"`
  - Hoặc (b) homepage stats tính sai / trang detail crash `s.funding_raised.toLocaleString is not a function`
- **Nguyên nhân:** Comment `FIX #3` đổi `fundingRaised` Zod từ `z.coerce.number()` sang `z.string().max(100)` để chứa free-form (`"$200K"`, `"2 tỷ VND"`). Nhưng:
  1. `getStartupStats` chạy `COALESCE(SUM(funding_raised), 0)` — yêu cầu numeric
  2. Public page đọc `s.funding_raised > 0` và `s.funding_raised.toLocaleString()` — JS number method
  3. `applicationSchema.fundingRaised` vẫn dùng `z.coerce.number()` và `apply/route.js` insert vào `applications.funding_raised`
- **Fix đề xuất:** Tách 2 cột — `funding_raised_amount` (numeric, dùng cho SUM/sort/compare) + `funding_raised_display` (text, hiển thị raw). Hoặc revert admin Zod về `z.coerce.number()` và bỏ free-form input.

---

## 🟠 High

### Bug #2 — Startups POST/PATCH: empty text → NULL vi phạm NOT NULL

- **Vị trí:** `src/app/api/admin/startups/route.js:71-72` · `src/app/api/admin/startups/[id]/route.js:48-51`
- **Triệu chứng:** Lưu DRAFT startup với `tagline`/`description`/`industry` để trống fail với `null value in column "description" violates not-null constraint`
- **Nguyên nhân:** Cùng pattern đã sửa ở `programs`. POST dùng `${d.tagline || null}, ${d.description || null}, … ${d.industry || null}`. Zod normalize empty → `""`. JS `"" || null` = `null` → vi phạm NOT NULL.
- **Fix:** `${d.description ?? ""}` (và `tagline`, `industry`, `short_desc`,… nếu NOT NULL)

### Bug #3 — Mentors POST/PATCH: same NOT NULL pattern

- **Vị trí:** `src/app/api/admin/mentors/route.js:70-74` · `src/app/api/admin/mentors/[id]/route.js:46-56`
- **Triệu chứng:** Lưu mentor với `title`/`bio`/`short_bio`/`organization`/`expertise` trống fail nếu cột NOT NULL
- **Fix:** `?? ""` cho text required

### Bug #4 — Events POST/PATCH: same NOT NULL pattern

- **Vị trí:** `src/app/api/admin/events/route.js:72` · `src/app/api/admin/events/[id]/route.js:49-51`
- **Fix:** `?? ""` cho `shortDesc`, `description`, `content`

### Bug #5 — Articles POST/PATCH: `excerpt`/`content`/`category` rỗng → NULL

- **Vị trí:** `src/app/api/admin/articles/route.js:73-75` · `src/app/api/admin/articles/[id]/route.js`
- **Triệu chứng:** Lưu DRAFT article không nội dung fail
- **Nguyên nhân:** POST dùng `${d.excerpt || null}`; `safeContent = d.content ? sanitizeHtml(d.content) : null` — falsy `""` thành `null`
- **Fix:** `const safeContent = d.content ? sanitizeHtml(d.content) : ""`; `${d.excerpt ?? ""}`

### Bug #6 — Resources POST/PATCH: `description`/`category` rỗng → NULL

- **Vị trí:** `src/app/api/admin/resources/route.js:69-73` · `src/app/api/admin/resources/[id]/route.js`
- **Fix:** `?? ""` cho field NOT NULL

### Bug #7 — `mentor.expertise` render array nhưng lưu string

- **Vị trí:** `src/app/(public)/page.js:564-572` · `src/app/(public)/mentors/page.js:169-172` · `src/app/(public)/mentors/[slug]/page.js:104-108`
- **Triệu chứng:** Homepage / mentors list / detail crash `m.expertise.slice is not a function`, hoặc tệ hơn — `.slice(0,2).map(...)` iterate qua từng ký tự, render mỗi ký tự thành 1 tag (vì JS string có `.slice` và iterable)
- **Nguyên nhân:** Admin form lưu `expertise` dạng comma-separated STRING (`"Product, AI/ML"`); DB cột là `text` (Zod FIX #6); public page chưa migrate, vẫn coi là array
- **Fix:** Tại public page convert trước khi map:
  ```js
  const tags = (m.expertise ?? "").split(",").map(s => s.trim()).filter(Boolean)
  ```

### Bug #13 — HTML KHÔNG sanitize cho `programs.content` và `events.content`

- **Vị trí:** `src/app/api/admin/programs/route.js:72` · `src/app/api/admin/programs/[id]/route.js:50` · `src/app/api/admin/events/route.js:72` · `src/app/api/admin/events/[id]/route.js:51`
- **Triệu chứng (XSS):** Admin (hoặc admin token bị compromise) lưu `<img src=x onerror=fetch(...)>` vào content; khi public render qua `dangerouslySetInnerHTML` (như `<RichTextRenderer />`) → XSS fires cho mọi visitor
- **Nguyên nhân:** Chỉ `articles` import `sanitizeHtml`. CLAUDE.md đã quy định "Sanitize HTML trước khi lưu DB" — đang vi phạm với 2 entity
- **Fix:** Thêm
  ```js
  import { sanitizeHtml } from "@/lib/sanitize"
  const safeContent = d.content ? sanitizeHtml(d.content) : ""
  // bind ${safeContent} thay vì ${d.content ?? ""}
  ```
  Áp dụng cho cả POST và PATCH của programs + events.

---

## 🟡 Medium

### Bug #9 — `getStartupStats` Redis fetch chặn static generation

- **Vị trí:** `src/app/(public)/page.js:33,122` + `src/lib/queries/startups.js`
- **Triệu chứng:** Build warning "Dynamic server usage" cho route `/`. Homepage bị ép render dynamic dù có `export const revalidate = 3600`.
- **Nguyên nhân:** `HomePage()` gọi `getStartupStats()`, nó lazy-import `@upstash/redis` và `redis.get(...)` — fetch network Next.js coi là uncacheable
- **Fix:** Wrap stats trong `unstable_cache` + bypass Redis lúc build:
  ```js
  if (process.env.NEXT_PHASE === "phase-production-build") return computeStatsFromDb()
  ```
  Hoặc dùng `unstable_cache(computeStatsFromDb, ["startup-stats"], { revalidate: 300 })`

### Bug #10 — Events form gửi `null` cho `startDate` nhưng Zod yêu cầu string

- **Vị trí:** `src/app/(admin)/admin/events/[id]/edit/page.js:~125` vs `src/lib/validations.js:158`
- **Triệu chứng:** User pick date rồi xóa → form gửi `null`, Zod `.string().min(1)` reject với "Expected string, received null"
- **Fix:** Form gửi `fields.startDate` (luôn string, có thể `""`), để server validate. Hoặc Zod `.nullable().refine(v => !!v, "...")`.

### Bug #12 — `redisLimit` Upstash incr-result coercion lỏng lẻo

- **Vị trí:** `src/lib/rate-limit.js:54-58`
- **Triệu chứng:** Rate limiter có thể fail open (catch nuốt error) hoặc không trip do `Math.max(0, MAX_REQ - [3])` = NaN
- **Nguyên nhân:** `pipeline.exec()` trả `[ incrResult, expireResult ]` — destructure first element nhưng không `Number()` ép kiểu
- **Fix:**
  ```js
  const result = await pipeline.exec()
  const count = Number(result?.[0])
  if (Number.isNaN(count)) return { ok: true, remaining: MAX_REQ } // fail open
  ```

### Bug #14 — Proxy `authorized()` không check role (defense-in-depth lỏng)

- **Vị trí:** `src/proxy.js:63-75` + `src/lib/auth.config.js:57`
- **Triệu chứng:** Hôm nay vô hại vì `auth.config.js` hard-code `role: "ADMIN"` cho mọi user verified. Khi DB thêm cột role thật, mọi user logged-in (kể cả non-admin) sẽ vào được `/admin`
- **Fix:** `return !!token && token.role === "ADMIN"` trong proxy. (Sau khi DB có cột role.)

### Bug #17 — `applications.additional_info` không sanitize HTML

- **Vị trí:** `src/app/api/programs/[id]/apply/route.js:~119,~134`
- **Triệu chứng:** Nếu trang admin render `additional_info` qua `dangerouslySetInnerHTML` → stored XSS surface ở admin panel
- **Fix:** Apply `sanitizeHtml` ở backend trước insert, hoặc escape khi render ở admin

### Bug #20 — `redisLimit` rewrite TTL mọi lần INCR

- **Vị trí:** `src/lib/rate-limit.js:54-55`
- **Triệu chứng:** TTL reset mỗi request — bug nhỏ, không gây sai logic nhưng làm window không đúng "sliding"
- **Fix:** Lua script `INCR` + `EXPIRE NX`, hoặc check kết quả INCR == 1 thì mới EXPIRE

---

## 🟢 Low

### Bug #8 — Testimonials `stage: "."` render badge `.` rỗng nghĩa

- **Vị trí:** `src/app/(public)/page.js:65, 74, 83` (literal `stage: "."`) — render tại `~line 627-629`
- **Triệu chứng:** Mỗi testimonial card hiện 1 badge xanh chỉ với "."
- **Fix:** Xóa key `stage` khỏi 3 testimonial, hoặc wrap `{t.stage && t.stage !== "." && (<span>...</span>)}`

### Bug #11 — Proxy rate-limit cover cả GET (không chỉ POST)

- **Vị trí:** `src/proxy.js:26-30, 86-92`
- **Triệu chứng:** Matcher `/api/events/:path*` và `/api/programs/:path*` apply cho mọi method → GET tương lai sẽ share window với POST
- **Fix:** Trong middleware:
  ```js
  if (req.method !== "POST") return NextResponse.next()
  ```
  Hoặc thu hẹp matcher còn `/api/programs/[id]/apply` và `/api/events/[id]/register`

### Bug #15 — Contact route trả 429 cho duplicate (sai ngữ nghĩa)

- **Vị trí:** `src/app/api/contact/route.js:42-47`
- **Triệu chứng:** User retry form 2 lần nhanh nhận 429 — confusing với rate-limit thật (cũng 429)
- **Fix:** Trả 200 silent (`{ success: true }`) hoặc 409

### Bug #18 — Cùng Bug #14 (auth không check role ở proxy `/api/admin`)

- **Vị trí:** `src/proxy.js:86-92`
- **Triệu chứng:** Defense-in-depth missing, không exploit được hôm nay
- **Fix:** Cùng Bug #14

### Bug #19 — Proxy matcher có `/api/programs/[id]/...` nhưng chỉ có `apply/` exist

- **Vị trí:** `src/proxy.js:91`
- **Triệu chứng:** Confusion (không bug runtime)
- **Fix:** Thu hẹp matcher còn `/api/programs/:id/apply`

### Slug uniqueness check thiếu trong PATCH (programs/startups/mentors/events/resources)

- **Vị trí:** Các route PATCH (trừ articles)
- **Triệu chứng:** Đổi slug trùng → INSERT thất bại 500 thay vì 422 với message rõ ràng
- **Fix:** Thêm:
  ```js
  const dup = await sql`SELECT id FROM <table> WHERE slug = ${d.slug} AND id != ${id} LIMIT 1`
  if (dup[0]) return NextResponse.json({ error: "Slug đã tồn tại" }, { status: 422 })
  ```
  Articles đã có pattern đúng — copy sang các entity khác.

---

## ✓ Verified OK (đã kiểm tra, không phải bug)

1. **DB singleton** (`src/lib/db.js`) — `neon(DATABASE_URL)` 1 lần, default export
2. **bcrypt** trong `auth.config.js` — dùng `bcrypt.compare(plaintext, hash)`, không lưu plaintext
3. **JWT 8h** — `maxAge: 8 * 60 * 60` khớp CLAUDE.md
4. **`requireApiAdmin`** — check cả session presence và `role === "ADMIN"`
5. **Rate limit wiring** — áp dụng đúng tầng proxy cho `/api/contact`, `/api/events/*`, `/api/programs/*`; handler không double rate-limit
6. **`next.config.mjs` remote pattern** — gồm cloudinary, unsplash, pravatar (đúng CLAUDE.md)
7. **`startups.fundingRaised` POST/PATCH `?? null`** — đúng trong isolation; bug là type (Bug #1), không phải null-coalescing
8. **`articles.published_at`** transition — `nowPublished && !wasPublished ? new Date() : (current.published_at ?? null)` đúng
9. **`articles` PATCH** kiểm slug uniqueness có `AND id != ${id}` đúng
10. **`programs.benefits` / `requirements`** — đã fix đúng `${d.benefits?.length ? d.benefits : null}` (history bug đã giải quyết)
11. **Honeypot trong `contact` và `apply`** — field `website` với `z.string().max(0)`, return fake success khi bot điền

---

## Workflow đề xuất khi fix

1. **Tạo branch riêng cho mỗi bug** (đặt tên `fix/bug-N-short-desc`) — KHÔNG commit lên git theo yêu cầu owner
2. **Áp dụng fix theo nhóm** — Bug #2/#3/#4/#5/#6 có cùng pattern → 1 PR chung
3. **Sau mỗi fix:** chạy `npm run build` để chắc không break compile
4. **Manual test bằng UI:** đặc biệt Bug #1 (startup save/render), Bug #7 (mentor expertise), Bug #13 (paste `<img onerror=...>` vào program/event content)
5. **Cập nhật docs:** sau khi fix, cập nhật `docs/database/schema.md` nếu NOT NULL được xác nhận
