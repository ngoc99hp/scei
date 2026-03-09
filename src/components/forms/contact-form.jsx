"use client"
// src/components/forms/contact-form.jsx
// Form liên hệ — gọi POST /api/contact

import { useState } from "react"

const SUBJECTS = [
  { value: "hop-tac", label: "Hợp tác & Đối tác" },
  { value: "uom-tao", label: "Ươm tạo & Tăng tốc" },
  { value: "ho-tro", label: "Hỗ trợ & Tư vấn" },
  { value: "khac", label: "Khác" },
]

export default function ContactForm() {
  const [form, setForm] = useState({
    fullName: "", organization: "", email: "",
    phone: "", subject: "", message: "", website: "",
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setServerMessage(data.message)
        setForm({ fullName: "", organization: "", email: "", phone: "", subject: "", message: "", website: "" })
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
        <div className="text-4xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-green-800 mb-2">Gửi thành công!</h3>
        <p className="text-green-700">{serverMessage}</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-green-600 underline underline-offset-2 hover:text-green-800"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot — ẩn với người dùng */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={handleChange}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {/* Server error */}
      {status === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverMessage}
        </div>
      )}

      {/* Họ tên + Tổ chức */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Họ và tên" required error={errors.fullName?.[0]}>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            className={inputCls(errors.fullName)}
          />
        </Field>
        <Field label="Tổ chức / Công ty" error={errors.organization?.[0]}>
          <input
            name="organization"
            value={form.organization}
            onChange={handleChange}
            placeholder="Tên công ty (không bắt buộc)"
            className={inputCls(errors.organization)}
          />
        </Field>
      </div>

      {/* Email + Số điện thoại */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <Field label="Số điện thoại" required error={errors.phone?.[0]}>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="0901 234 567"
            className={inputCls(errors.phone)}
          />
        </Field>
      </div>

      {/* Chủ đề */}
      <Field label="Chủ đề" required error={errors.subject?.[0]}>
        <select
          name="subject"
          value={form.subject}
          onChange={handleChange}
          className={inputCls(errors.subject)}
        >
          <option value="">-- Chọn chủ đề --</option>
          {SUBJECTS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </Field>

      {/* Nội dung */}
      <Field label="Nội dung" required error={errors.message?.[0]}>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="Mô tả chi tiết yêu cầu hoặc câu hỏi của bạn..."
          className={inputCls(errors.message)}
        />
      </Field>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 transition-colors"
      >
        {status === "loading" ? "Đang gửi..." : "Gửi liên hệ"}
      </button>
    </form>
  )
}

// ── Helpers ────────────────────────────────────────────────────

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