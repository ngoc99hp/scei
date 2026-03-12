"use client"
// src/app/global-error.js
// Bắt lỗi trong root layout.js — last resort error boundary.
// Khác với error.js: file này THAY THẾ toàn bộ root layout khi render.
// Vì vậy phải tự include <html><body>.
//
// Khi nào cần: ThemeProvider crash, font load fail, layout DB query fail...

import Link from "next/link"

export default function GlobalError({ error, reset }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#fafafa" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: "400px" }}>
            <p style={{ fontSize: "4rem", marginBottom: "1rem" }}>🚨</p>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem", color: "#111" }}>
              Hệ thống tạm thời gián đoạn
            </h1>
            <p style={{ color: "#666", marginBottom: "2rem", lineHeight: 1.6 }}>
              SCEI đang gặp sự cố kỹ thuật. Đội ngũ chúng tôi đã được thông báo
              và đang khắc phục. Vui lòng thử lại sau ít phút.
            </p>
            {error?.digest && (
              <p style={{ fontSize: "0.75rem", color: "#999", marginBottom: "1.5rem", fontFamily: "monospace" }}>
                Ref: {error.digest}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  background: "#0083c2",
                  color: "white",
                  border: "none",
                  borderRadius: "9999px",
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Thử lại
              </button>
              <a
                href="/"
                style={{
                  background: "transparent",
                  color: "#333",
                  border: "1px solid #ddd",
                  borderRadius: "9999px",
                  padding: "0.625rem 1.5rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Trang chủ
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}