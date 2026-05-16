# CLAUDE.md — UI / CSS Rules (SCEI Design System v2)

> Áp dụng cho mọi component trong `src/components/` và toàn bộ JSX trong `src/`.
> Single source of truth cho tokens: `src/app/globals.css`.

---

## 1. Nguyên tắc cốt lõi

- `globals.css` quyết định **what** (giá trị token).
- Tailwind quyết định **how** (utility class).
- Component chỉ quyết định **where** (nơi áp dụng class).

---

## 2. Màu sắc — bắt buộc dùng semantic token

### Dùng Tailwind utility được map từ token

| Token class            | Dùng khi                              |
|------------------------|---------------------------------------|
| `bg-background`        | Nền page                              |
| `text-foreground`      | Text mặc định                         |
| `bg-card`              | Card, panel, modal                    |
| `text-card-foreground` | Text trong card                       |
| `border-border`        | Viền input, card, divider             |
| `bg-primary`           | Button CTA chính                      |
| `text-primary-foreground` | Text trên nền primary              |
| `bg-secondary`         | Button CTA phụ                        |
| `bg-accent`            | Hover highlight, tag active           |
| `bg-muted`             | Background phụ, skeleton              |
| `text-muted-foreground`| Label, hint, placeholder              |
| `bg-destructive`       | Error, delete action                  |
| `text-destructive`     | Thông báo lỗi inline                  |
| `bg-success`           | Thành công                            |
| `bg-warning`           | Cảnh báo                              |
| `bg-info`              | Thông tin                             |

### Cấm tuyệt đối

```jsx
// ❌ Hardcode màu
<div className="bg-blue-500 text-white">
<div style={{ color: "#fff" }}>
<div className="dark:bg-gray-900">

// ✅ Đúng
<div className="bg-primary text-primary-foreground">
```

- Không dùng: `#fff`, `#000`, `rgb()`, `hsl()`, `oklch()` trực tiếp trong component
- Không dùng: `style={{ color: ... }}`, `style={{ background: ... }}`
- Không tự tạo CSS variable mới bên trong component
- Không dùng `dark:` với màu hardcode (vd: `dark:bg-gray-800`)

---

## 3. Dark mode

Dark mode tự động hoạt động qua `.dark` class trên `<html>`. **Component không cần logic dark mode.**

```jsx
// ✅ Tự hoạt động — không cần dark: variant
<div className="bg-card text-card-foreground border border-border">
  Content
</div>

// ❌ Không làm thế này
<div className="bg-white dark:bg-gray-800">
```

---

## 4. Typography

Dùng Tailwind trực tiếp — không dùng CSS variable cho font size trong component:

```jsx
<h1 className="text-3xl font-bold">Heading</h1>
<h2 className="text-2xl font-semibold">Section</h2>
<p className="text-base leading-normal">Body text</p>
<p className="text-sm text-muted-foreground">Hint / label</p>
<code className="font-mono text-sm">code snippet</code>
```

Font family:
- UI text: `font-sans` (Inter, Geist Sans)
- Code: `font-mono` (Geist Mono)

---

## 5. Spacing

Dùng Tailwind utility — không dùng `var(--space-*)` trong component:

```jsx
// ✅
<div className="p-6 space-y-4 gap-3">

// ❌
<div style={{ padding: "var(--space-6)" }}>
```

---

## 6. Border radius

```jsx
<div className="rounded-md">   // input, button nhỏ
<div className="rounded-lg">   // card, panel
<div className="rounded-xl">   // modal, dialog lớn
<div className="rounded-full"> // avatar, badge tròn
```

---

## 7. Shadow

```jsx
<div className="shadow-sm">   // card phẳng
<div className="shadow-md">   // card nổi, dropdown
<div className="shadow-lg">   // modal
```

---

## 8. Form inputs — pattern chuẩn

```jsx
<input
  className="
    bg-background border border-input text-foreground
    placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-ring
    rounded-md px-3 py-2 text-sm w-full
  "
/>
```

Focus state bắt buộc dùng `focus:ring-ring` — không tự chọn màu khác.

---

## 9. Button — pattern chuẩn

```jsx
// Primary
<button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors">
  Lưu
</button>

// Secondary
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-4 py-2 text-sm font-medium transition-colors">
  Hủy
</button>

// Destructive
<button className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md px-4 py-2 text-sm font-medium transition-colors">
  Xóa
</button>

// Ghost / outline
<button className="border border-border text-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-4 py-2 text-sm transition-colors">
  Xem thêm
</button>
```

---

## 10. Card — pattern chuẩn

```jsx
<div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-6">
  Content
</div>
```

---

## 11. Trạng thái (semantic states)

```jsx
// Thành công
<div className="bg-success/10 text-success border border-success/20 rounded-md p-3">
  Lưu thành công
</div>

// Lỗi
<p className="text-destructive text-sm">Có lỗi xảy ra</p>
<div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-md p-3">
  Lỗi kết nối
</div>

// Cảnh báo
<div className="bg-warning/10 text-warning-foreground border border-warning/20 rounded-md p-3">
  Cảnh báo
</div>
```

---

## 12. Sidebar (chỉ dùng trong Admin layout)

```jsx
<aside className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
  <nav>
    <a className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground px-3 py-2 rounded-md">
      Menu item
    </a>
    <a className="bg-sidebar-accent text-sidebar-accent-foreground px-3 py-2 rounded-md">
      Active item
    </a>
  </nav>
</aside>
```

Không dùng sidebar token ở public pages.

---

## 13. Charts / Data Visualization

```js
const chartColors = [
  "var(--chart-1)",  // blue
  "var(--chart-2)",  // green
  "var(--chart-3)",  // orange
  "var(--chart-4)",  // purple
  "var(--chart-5)",  // teal
]
```

Không hardcode màu hex/rgb cho chart.

---

## 14. Class composition

Dùng `cn()` từ `@/lib/utils` khi merge class động:

```jsx
import { cn } from "@/lib/utils"

<div className={cn(
  "bg-card border border-border rounded-lg p-4",
  isActive && "border-primary",
  className,
)}>
```

Không dùng string concatenation thủ công cho class.

---

## 15. Checklist trước khi commit

- [ ] Không có `#`, `rgb()`, `hsl()`, `oklch()` trong component
- [ ] Không có `style={{ color: ... }}` hoặc `style={{ background: ... }}`
- [ ] Không có `dark:bg-gray-*` hay `dark:text-gray-*`
- [ ] Form input có `focus:ring-ring`
- [ ] Màu lỗi dùng `text-destructive` / `bg-destructive`
- [ ] Màu thành công dùng `bg-success` / `text-success`
- [ ] Sidebar token chỉ trong admin layout
- [ ] Class phức tạp dùng `cn()`, không string concatenation

---

## 16. Thêm token mới

Nếu cần token chưa có:
1. Thêm vào `:root` và `.dark` trong `globals.css`
2. Map vào `@theme inline` trong `globals.css`
3. Dùng qua Tailwind class — không dùng `var()` trực tiếp trong component

**Không bao giờ** thêm CSS variable trực tiếp vào component hay module CSS.
