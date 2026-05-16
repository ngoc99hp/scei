# SCEI Portal — Tài liệu dự án

Cổng thông tin **Trung tâm Khởi nghiệp & Đổi mới Sáng tạo (SCEI)** — Next.js 16 App Router, PostgreSQL (Neon), Cloudinary, NextAuth.

> Tài liệu được tổng hợp từ snapshot codebase ngày **2026-05-16**. Khi code thay đổi mạnh, cần cập nhật lại các file tương ứng.

## Cấu trúc thư mục `docs/`

| File / thư mục | Mục đích |
|----------------|----------|
| [README.md](./README.md) | (Bạn đang đọc) Index toàn bộ docs |
| [architecture.md](./architecture.md) | Tech stack, layout thư mục, convention, biến môi trường |
| [pages/public.md](./pages/public.md) | Map toàn bộ trang public (route, data source, SEO) |
| [pages/admin.md](./pages/admin.md) | Map toàn bộ trang admin + UI primitives |
| [api/reference.md](./api/reference.md) | Reference tất cả route handler (auth, body, response, side effect) |
| [database/schema.md](./database/schema.md) | Schema PostgreSQL được suy ra từ code (table, column, enum, FK) |
| [plans/bug-fixes.md](./plans/bug-fixes.md) | **20 bug** đã audit, phân loại theo độ ưu tiên |
| [plans/security-hardening.md](./plans/security-hardening.md) | Kế hoạch siết bảo mật (XSS, auth defense-in-depth, rate-limit) |

## Bắt đầu nhanh

```bash
# Cài deps
npm install

# Dev
npm run dev      # http://localhost:3000

# Build production (đã verified pass)
npm run build
npm run start
```

Biến môi trường bắt buộc — xem [architecture.md → Environment](./architecture.md#environment-variables).

## Convention quan trọng (đã xác lập)

- **Không TypeScript** — chỉ `.js` / `.jsx`
- **Không ORM** — raw SQL với Neon tagged templates
- **Không commit code lên git** (theo yêu cầu của owner — ghi chú trong CLAUDE.md)
- Path alias `@/` → `src/`
- Form: React Hook Form + Zod (schemas tập trung trong `src/lib/validations.js`)
- Style: Tailwind v4 + CSS variables OKLch
- Icons: chỉ `lucide-react`
- Rich text: Tiptap → HTML → sanitize qua `src/lib/sanitize.js` trước khi lưu

## Trạng thái dự án (snapshot 2026-05-16)

| Hạng mục | Trạng thái |
|----------|-----------|
| Build production | ✅ Pass (exit 0, 71 static page generated) |
| TypeScript checking | N/A (dự án thuần JS) |
| Unit test | ⚠️ Chỉ có `src/lib/__tests__/sanitize.test.js` — không có test runner cấu hình |
| ESLint | ⚠️ Không có script `lint` trong package.json |
| Bug đã phát hiện | **20** (xem [plans/bug-fixes.md](./plans/bug-fixes.md)) |
| Bug critical | **1** (mâu thuẫn type `funding_raised`) |
| Bug high | **6** (NOT NULL violation, XSS, expertise as array) |

## Roadmap đề xuất

1. **Sprint hot-fix** — sửa 1 critical + 6 high bug ở [plans/bug-fixes.md](./plans/bug-fixes.md)
2. **Security hardening** — XSS sanitize cho `programs`/`events`, auth defense-in-depth trong proxy ([plans/security-hardening.md](./plans/security-hardening.md))
3. **Test infra** — thêm Vitest + ESLint, mở rộng test sanitize sang validations
4. **Schema lock-in** — tạo file `db/schema.sql` chính thức từ [database/schema.md](./database/schema.md) để chống schema drift
