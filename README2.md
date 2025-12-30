# 🎨 SCEI Design Tokens

**How to use Design Tokens (Frontend Guide)**

> File gốc: `app/globals.css`
> Design System: **SCEI v2 – Innovation Center Theme**
> Stack: **Next.js + Tailwind CSS v4**

---

## 1. Design Tokens là gì?

**Design Tokens** là các **CSS Variables** định nghĩa:

* Màu sắc (colors)
* Typography (font, size, line-height)
* Spacing (khoảng cách)
* Radius, shadow
* Trạng thái (success, warning, destructive…)

👉 `globals.css` là **single source of truth** cho toàn bộ UI.

**Mục tiêu**

* Không hardcode màu
* Không copy style giữa component
* Đảm bảo Light/Dark mode hoạt động đồng bộ

---

## 2. Nguyên tắc bắt buộc (Rules of Engagement)

### ✅ DO

* Dùng **Tailwind utilities** (`bg-primary`, `text-muted-foreground`)
* Dùng **semantic token** thay vì màu cụ thể
* Để `.dark` điều khiển dark mode
* Tái sử dụng token cho mọi component

### ❌ DON'T

* ❌ Không dùng `#fff`, `#000`, `rgb()`, `oklch()` trong component
* ❌ Không dùng `style={{ color: ... }}`
* ❌ Không tự tạo CSS variable mới trong component
* ❌ Không dùng `dark:` với màu hardcode

---

## 3. Cách sử dụng màu sắc (Colors)

### 3.1 Core colors (dùng 90% thời gian)

| Token             | Dùng khi nào   |
| ----------------- | -------------- |
| `bg-background`   | Nền page       |
| `text-foreground` | Text mặc định  |
| `bg-card`         | Card, panel    |
| `border-border`   | Viền           |
| `bg-primary`      | CTA chính      |
| `bg-secondary`    | CTA phụ        |
| `bg-accent`       | Highlight      |
| `bg-muted`        | Background phụ |
| `bg-destructive`  | Error / danger |

#### Ví dụ

```jsx
<div className="bg-card text-foreground border border-border rounded-lg p-6">
  Content
</div>
```

---

### 3.2 Semantic colors (trạng thái)

| Token            | Dùng khi   |
| ---------------- | ---------- |
| `bg-success`     | Thành công |
| `bg-warning`     | Cảnh báo   |
| `bg-info`        | Thông tin  |
| `bg-destructive` | Lỗi        |

```jsx
<div className="bg-success text-success-foreground p-4 rounded-md">
  Lưu thành công
</div>
```

---

## 4. Typography – cách dùng đúng

### 4.1 Font family

```jsx
<p className="font-sans">Text mặc định</p>
<code className="font-mono">Code</code>
```

### 4.2 Font size & weight

👉 **KHÔNG dùng CSS variable cho size**
👉 **Dùng Tailwind trực tiếp**

```jsx
<h1 className="text-3xl font-bold">Heading</h1>
<p className="text-base leading-normal">Body text</p>
```

---

## 5. Spacing – khoảng cách

Token spacing tồn tại để:

* Đồng bộ design
* Dùng khi cần inline style hoặc custom CSS

👉 **Ưu tiên Tailwind utilities**

```jsx
<div className="p-6 space-y-4">
  <p>Item 1</p>
  <p>Item 2</p>
</div>
```

❌ Không nên:

```css
margin-bottom: var(--space-6);
```

---

## 6. Radius & Shadow

### Radius

```jsx
<div className="rounded-lg">Card</div>
<div className="rounded-xl">Modal</div>
```

> `rounded-lg` → `--radius`

---

### Shadow

```jsx
<div className="shadow-md bg-card rounded-lg">
  Card
</div>
```

---

## 7. Forms (Input, Focus)

### Input chuẩn

```jsx
<input
  className="
    bg-background
    border border-border
    text-foreground
    focus:ring-2 focus:ring-ring
    rounded-md px-3 py-2
  "
/>
```

---

## 8. Dark Mode – cách hoạt động

Dark mode **KHÔNG cần đổi component**.

### Chỉ cần:

```html
<html class="dark">
```

Toàn bộ token tự override:

* `--background`
* `--foreground`
* `--primary`
* `--border`
* `--shadow-*`

👉 Component vẫn giữ nguyên class.

---

## 9. Sidebar (Admin)

### Khi nào dùng?

* Chỉ trong **Admin layout**
* Không dùng cho public pages

```jsx
<aside className="bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
  Menu
</aside>
```

---

## 10. Charts & Data Visualization

Dùng cho:

* Dashboard
* Analytics
* Reports

```js
const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
];
```

---

## 11. Pattern chuẩn – nên copy

### Card

```jsx
<div className="bg-card text-card-foreground border border-border rounded-lg shadow-sm p-6">
  Content
</div>
```

### Button

```jsx
<button className="bg-primary text-primary-foreground rounded-md px-4 py-2">
  Action
</button>
```

### Error state

```jsx
<p className="text-destructive">Có lỗi xảy ra</p>
```

---

## 12. Checklist cho Code Review

✅ Dùng Tailwind token (`bg-primary`, không `bg-blue-500`)
✅ Không hardcode màu
✅ Component không cần biết light/dark
✅ Form có `focus:ring-ring`
❌ Không dùng inline style màu sắc

---

## 13. Tóm tắt triết lý

> **globals.css quyết định “what”**
> **Tailwind quyết định “how”**
> **Component chỉ quyết định “where”**

---

