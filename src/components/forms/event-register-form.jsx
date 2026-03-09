"use client"
// src/components/forms/event-register-form.jsx
// Form đăng ký tham dự sự kiện — gọi POST /api/events/[id]/register
// Props: eventId (string), eventTitle (string), onSuccess? (fn)

import { useState } from "react"

export default function EventRegisterForm({ eventId, eventTitle, onSuccess }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", organization: "", note: "",
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState("idle") // idle | loading | success | error
  const [serverMessage, setServerMessage] = useState("")

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus("loading")
    setErrors({})
    setServerMessage("")

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setServerMessage(data.message)
        onSuccess?.()
      } else if (res.status === 422 && data.fields) {
        setStatus("idle")
        setErrors(data.fields)
      } else {
        setStatus("error")
        setServerMessage(data.error ?? "Đã xảy ra lỗi. Vui lòng thử lại.")
      }
    } catch {
      setStatus("error")
      setServerMessage("Không thể kết nối đến máy chủ. Vui lòng thử lại.")
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">Đăng ký thành công!</h3>
        <p className="text-sm text-green-700">{serverMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {eventTitle && (
        <p className="text-sm text-gray-500 mb-2">
          Đăng ký tham dự: <span className="font-medium text-gray-800">{eventTitle}</span>
        </p>
      )}

      {status === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverMessage}
        </div>
      )}

      <Field label="Họ và tên" required error={errors.name?.[0]}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Nguyễn Văn A"
          className={inputCls(errors.name)}
        />
      </Field>

      <Field label="Email" required error={errors.email?.[0]}>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="email@example.com"
          className={inputCls(errors.email)}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Số điện thoại" error={errors.phone?.[0]}>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="0901 234 567"
            className={inputCls(errors.phone)}
          />
        </Field>
        <Field label="Tổ chức / Công ty" error={errors.organization?.[0]}>
          <input
            name="organization"
            value={form.organization}
            onChange={handleChange}
            placeholder="Tên công ty"
            className={inputCls(errors.organization)}
          />
        </Field>
      </div>

      <Field label="Ghi chú" error={errors.note?.[0]}>
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          rows={3}
          placeholder="Câu hỏi hoặc thông tin thêm (không bắt buộc)"
          className={inputCls(errors.note)}
        />
      </Field>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 transition-colors"
      >
        {status === "loading" ? "Đang đăng ký..." : "Xác nhận đăng ký"}
      </button>
    </form>
  )
}

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

function inputCls(error) {
  return [
    "w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900",
    "placeholder:text-gray-400 outline-none transition-colors",
    "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
    error
      ? "border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-500"
      : "border-gray-300 bg-white hover:border-gray-400",
  ].join(" ")
}