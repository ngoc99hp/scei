"use client"
// src/components/forms/event-register-form.jsx
// Form đăng ký sự kiện — gọi POST /api/events/[id]/register
// Dùng trong: events/[slug]/page.js

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function EventRegisterForm({ eventId, eventTitle }) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState("")
  const [fields, setFields]   = useState({
    name: "", email: "", phone: "", organization: "", note: "",
  })
  const [fieldErrors, setFieldErrors] = useState({})

  function handleChange(e) {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setFieldErrors(prev => ({ ...prev, [e.target.name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setFieldErrors({})

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(fields),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.fields) setFieldErrors(data.fields)
        else setError(data.error || "Đã xảy ra lỗi. Vui lòng thử lại.")
      } else {
        setSuccess(true)
      }
    } catch {
      setError("Không thể kết nối. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // ── Trigger button (khi chưa mở form) ──────────────────────────────────────
  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="w-full rounded-full font-bold h-11"
      >
        Đăng ký tham gia
      </Button>
    )
  }

  // ── Thành công ──────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="font-semibold text-green-800">Đăng ký thành công!</p>
        <p className="text-sm text-green-700 mt-1">
          Chúng tôi sẽ gửi thông tin chi tiết đến email của bạn.
        </p>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-bold text-base mb-4">Đăng ký: {eventTitle}</h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Họ tên */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={fields.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Nguyễn Văn A"
          />
          {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name[0]}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="email@example.com"
          />
          {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email[0]}</p>}
        </div>

        {/* Số điện thoại */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <input
            name="phone"
            type="tel"
            value={fields.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="0901234567"
          />
          {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone[0]}</p>}
        </div>

        {/* Tổ chức */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tổ chức / Trường học
          </label>
          <input
            name="organization"
            value={fields.organization}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="SCEI, UEH, ..."
          />
        </div>

        {/* Ghi chú */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú
          </label>
          <textarea
            name="note"
            value={fields.note}
            onChange={handleChange}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            placeholder="Câu hỏi hoặc yêu cầu đặc biệt..."
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="flex-1 rounded-full font-bold"
            disabled={loading}
          >
            {loading ? "Đang gửi..." : "Xác nhận đăng ký"}
          </Button>
        </div>
      </form>
    </div>
  )
}