"use client"
// src/components/ui/route-error.jsx
// Client component dùng chung cho tất cả route-level error.js.
// Mỗi route chỉ cần wrap component này với config riêng.
//
// Tại sao tách thành component riêng?
//   - error.js phải là "use client" → không thể export metadata
//   - Mỗi route có error message/action khác nhau (events vs programs vs admin)
//   - DRY: tránh copy-paste boilerplate 6+ lần

import { useEffect } from "react"
import Link from "next/link"

/**
 * @param {object}   props
 * @param {Error}    props.error       - Error object từ Next.js error boundary
 * @param {Function} props.reset       - Hàm reset error boundary (retry)
 * @param {string}   props.title       - Tiêu đề lỗi
 * @param {string}   props.description - Mô tả chi tiết
 * @param {string}   props.backHref    - URL của nút "Quay lại"
 * @param {string}   props.backLabel   - Label của nút "Quay lại"
 * @param {string}   [props.icon]      - Emoji icon (default "⚠️")
 */
export function RouteError({
  error,
  reset,
  title       = "Không thể tải nội dung",
  description = "Đã xảy ra lỗi khi tải trang. Vui lòng thử lại.",
  backHref    = "/",
  backLabel   = "Về trang chủ",
  icon        = "⚠️",
}) {
  useEffect(() => {
    // Trong production: gửi error lên monitoring (Sentry/Datadog)
    console.error(error)
    // Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full text-center">
        <div className="text-4xl mb-5" aria-hidden="true">{icon}</div>

        <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{description}</p>

        {/* Error digest — support có thể dùng để tra cứu log */}
        {error?.digest && (
          <p className="text-xs text-muted-foreground/50 font-mono mb-5">
            {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Thử lại
          </button>
          <Link
            href={backHref}
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}