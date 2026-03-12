"use client"
// src/app/error.js
// Global error boundary — bắt tất cả lỗi runtime không được handle.
// PHẢI là Client Component (Next.js yêu cầu để reset được).
//
// Được kích hoạt khi:
//   - Server Component throw error không phải notFound()
//   - Client Component throw error không có local error boundary
//   - DB crash, network timeout, unexpected null reference...
//
// LƯU Ý: File này KHÔNG bắt lỗi trong layout.js root.
//         Để bắt layout errors, cần global-error.js (xem bên dưới).

import { useEffect } from "react"
import Link from "next/link"

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log error ra console trong dev
    // Trong production, đây là nơi gọi Sentry/Datadog/LogRocket
    console.error("[GlobalError]", error)

    // Ví dụ tích hợp Sentry (uncomment khi setup):
    // import * as Sentry from "@sentry/nextjs"
    // Sentry.captureException(error)
  }, [error])

  // Phân loại lỗi để hiển thị message phù hợp
  const isNotFound    = error?.message?.includes("not found") || error?.digest?.includes("404")
  const isNetworkErr  = error?.message?.includes("fetch") || error?.message?.includes("network")
  const isDatabaseErr = error?.message?.includes("database") || error?.message?.includes("NeonDbError")

  const title = isNotFound
    ? "Không tìm thấy nội dung"
    : isNetworkErr
      ? "Lỗi kết nối"
      : isDatabaseErr
        ? "Lỗi hệ thống"
        : "Đã xảy ra lỗi"

  const description = isNotFound
    ? "Nội dung bạn yêu cầu không tồn tại hoặc đã bị xóa."
    : isNetworkErr
      ? "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại."
      : isDatabaseErr
        ? "Hệ thống đang gặp sự cố. Chúng tôi đã được thông báo và đang xử lý."
        : "Một lỗi không mong đợi đã xảy ra. Vui lòng thử lại hoặc quay về trang chủ."

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className="text-5xl mb-6" aria-hidden="true">
          {isNotFound ? "🔍" : isNetworkErr ? "📡" : "⚠️"}
        </div>

        {/* Message */}
        <h2 className="text-xl font-bold text-foreground mb-3">{title}</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">{description}</p>

        {/* Error code cho dev/support (chỉ hiện khi có digest) */}
        {error?.digest && (
          <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors"
          >
            Về trang chủ
          </Link>
        </div>

      </div>
    </div>
  )
}