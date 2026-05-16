# Kế hoạch siết bảo mật

Trên cơ sở audit bug ([bug-fixes.md](./bug-fixes.md)), document này gom các vấn đề liên quan đến bảo mật và đề xuất biện pháp phòng ngừa tổng thể.

## Bối cảnh

- Stack: Next.js 16 App Router, Neon PostgreSQL, NextAuth.js JWT, Cloudinary, Upstash Redis
- Mọi `/api/admin/**` đều yêu cầu role ADMIN (JWT 8h, bcryptjs salt 12)
- Public POST có rate-limit ở proxy (10 req/60s/IP)
- Magic-byte verification cho upload image
- Honeypot field `website` cho contact + apply
- HTML sanitizer allowlist cho `articles.content`

## Vấn đề tồn tại

### 1. XSS — Stored

| Surface | File | Mức độ |
|---------|------|--------|
| `programs.content` không sanitize | `src/app/api/admin/programs/route.js` + `[id]/route.js` | 🟠 |
| `events.content` không sanitize | `src/app/api/admin/events/route.js` + `[id]/route.js` | 🟠 |
| `applications.additional_info` không sanitize | `src/app/api/programs/[id]/apply/route.js` | 🟡 |

**Bài học từ `articles`:** entity duy nhất đang làm đúng. Pattern chuẩn:

```js
import { sanitizeHtml } from "@/lib/sanitize"

const safeContent = d.content ? sanitizeHtml(d.content) : ""
// bind ${safeContent} thay vì ${d.content ?? ""}
```

**Hành động:**
1. Đồng bộ pattern sang `programs` + `events` POST/PATCH
2. Với `applications.additional_info`: thêm sanitize ở backend; bonus thêm escape khi render trong admin
3. Cân nhắc viết integration test gọi route POST với payload `<img src=x onerror=alert(1)>` để verify

### 2. Defense in depth: auth role check ở proxy

**Hiện tại:**
- `src/proxy.js` `authorized()` callback chỉ check `!!token`
- Mọi user verified hard-code `role: "ADMIN"` trong `auth.config.js` → vô hại
- Khi DB có cột role thật (user thường, mentor, admin,…), non-admin user sẽ vào được `/admin/*` (proxy không chặn), chỉ bị chặn ở handler API

**Fix:**
```js
// src/proxy.js
authorized({ token }) {
  return !!token && token.role === "ADMIN"
}
```

Và đảm bảo:
- `auth.config.js` set `token.role` từ DB sau khi cột role được thêm
- `requireApiAdmin()` đã làm đúng — giữ nguyên

### 3. Rate-limit weak spots

| Vấn đề | Mức độ | Fix |
|--------|--------|-----|
| Matcher cover cả GET, không chỉ POST ([Bug #11](./bug-fixes.md)) | 🟢 | Trong middleware: `if (req.method !== "POST") return NextResponse.next()` |
| `redisLimit` không `Number()` ép kiểu kết quả INCR ([Bug #12](./bug-fixes.md)) | 🟡 | `const count = Number(result?.[0])` + NaN guard |
| TTL bị rewrite mọi request ([Bug #20](./bug-fixes.md)) | 🟢 | Lua script INCR + EXPIRE NX, hoặc check INCR == 1 thì set TTL |
| Per-IP only (không có user-level limit cho admin) | 🟢 | Cân nhắc nếu admin operation tăng cao |
| Status code 429 collision với contact dedupe ([Bug #15](./bug-fixes.md)) | 🟢 | Đổi dedupe sang 200 silent hoặc 409 |

### 4. Honeypot — đang đúng

`contact` và `apply` đều có field `website` ẩn với `z.string().max(0, "Bot detected")`. Bot fill → return fake success.

**Cân nhắc bổ sung:**
- Time-based check: form load < 2s rồi submit = bot
- Cloudflare Turnstile / hCaptcha cho contact form công khai (nếu lượng spam tăng)

### 5. Upload security

**Đang làm đúng:**
- Whitelist MIME (image/jpeg|png|webp|gif)
- Max 5MB
- **Magic-byte check** server-side — chống MIME spoofing
- Tên file random + Date.now() — không trust user filename

**Cải thiện:**
- Đặt `Content-Disposition: inline` hoặc `attachment` rõ ràng để chống reflective XSS qua SVG (hiện chưa cho SVG nhưng để chắc chắn)
- Thêm `Content-Security-Policy` cho `res.cloudinary.com` (giảm ảnh hưởng nếu Cloudinary bị compromise)

### 6. Password & auth

**Đang làm đúng:**
- bcryptjs salt 12 (đủ mạnh tại thời điểm 2026)
- JWT 8h — không quá dài để giảm hậu quả lộ token
- NextAuth cookie httpOnly + secure (default)

**Cải thiện:**
- **Account lockout / brute-force protection:** hiện `POST /api/auth/[...nextauth]/callback/credentials` không rate-limit. Brute force credentials có thể fly under radar
  - Fix: thêm matcher `/api/auth/callback/credentials` vào `proxy.js` rate-limit (10 req/60s/IP)
- **Password policy:** Zod chỉ check `min(8)` — không yêu cầu hỗn hợp ký tự
  - Cân nhắc thêm `zxcvbn` hoặc rule cơ bản (≥1 chữ hoa + ≥1 số) — tradeoff UX

### 7. SQL injection

**Đang dùng tagged template literal Neon** — auto-escape params. Không có raw concatenation tìm thấy trong audit.

**Lưu ý:** Khi mở rộng, **không** dùng:
```js
sql.unsafe(`SELECT * FROM ${userInput}`)  // ❌ Không bao giờ
```

### 8. CSRF

NextAuth tự sinh CSRF token cho POST `/api/auth/*`. Các admin API dùng cookie session — nếu chạy cross-origin, mọi `POST /api/admin/...` cần CSRF token. Hiện đang same-origin nên tạm OK.

**Khi mở mobile app / SDK đọc API admin:**
- Đổi sang Bearer token (NextAuth `getServerSession` + custom token endpoint)
- Hoặc giữ cookie nhưng strict SameSite

### 9. Public endpoint exposure

| Endpoint | Sensitive data exposure | Mitigation |
|----------|------------------------|-----------|
| `GET /api/health` | OK — chỉ trả status DB/Redis | — |
| Public page server fetch | Trang `/news/[slug]` đã có bot filter cho view_count | OK |
| `GET /api/admin/**` | Yêu cầu admin auth | OK |

### 10. Cloudinary credentials

- API key + secret nằm trong env vars
- Không có signed upload hiện tại — mọi upload phải qua `/api/admin/upload` (yêu cầu admin auth) → OK
- Khi public form (apply / register) cần upload (vd pitch deck file), cần thiết kế **signed URL pattern** (Cloudinary signed upload params) thay vì cho phép upload trực tiếp từ client

---

## Checklist hardening (đề xuất theo thứ tự)

- [ ] **P0** Sanitize HTML cho `programs.content`, `events.content` (Bug #13)
- [ ] **P0** Sanitize HTML cho `applications.additional_info` (Bug #17)
- [ ] **P1** Rate-limit `/api/auth/callback/credentials` (brute-force protection)
- [ ] **P1** `redisLimit` Number() coercion + NaN guard (Bug #12)
- [ ] **P2** Proxy chỉ rate-limit khi `method === "POST"` (Bug #11)
- [ ] **P2** Đổi contact dedupe response từ 429 sang 200 silent hoặc 409 (Bug #15)
- [ ] **P2** Khi DB thêm cột role, update `proxy.js authorized()` check `token.role === "ADMIN"` (Bug #14)
- [ ] **P3** Lua script cho `redisLimit` INCR + EXPIRE NX (Bug #20)
- [ ] **P3** Cân nhắc CSP header riêng cho image domain
- [ ] **P3** Cân nhắc tăng password policy hoặc dùng zxcvbn

## Audit định kỳ đề xuất

| Hạng mục | Tần suất |
|----------|----------|
| `npm audit` / `npm outdated` | Hàng tháng |
| Manual XSS test khi thêm rich-text field mới | Theo PR |
| Penetration test cơ bản (OWASP ZAP / Burp) | Trước launch production |
| Review session/JWT log bất thường (Vercel Logs / Neon Audit) | Hàng tuần |
| Rotate `NEXTAUTH_SECRET` | 6 tháng / hoặc khi nghi compromise |
| Rotate Cloudinary API secret | Khi nghi compromise |

## Tham chiếu

- OWASP Top 10 (2021): https://owasp.org/Top10/
- NextAuth.js best practices: https://next-auth.js.org/configuration/options#session
- Cloudinary signed upload: https://cloudinary.com/documentation/signatures
