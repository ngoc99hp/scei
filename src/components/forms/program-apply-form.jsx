"use client"
// src/components/forms/program-apply-form.jsx
// Form nộp đơn chương trình — gọi POST /api/programs/[id]/apply
// Dùng trong: programs/[slug]/page.js

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const STAGES = [
  { value: "IDEA",     label: "Ý tưởng" },
  { value: "MVP",      label: "MVP" },
  { value: "SEED",     label: "Seed" },
  { value: "SERIES_A", label: "Series A" },
  { value: "GROWTH",   label: "Tăng trưởng" },
  { value: "SCALE",    label: "Mở rộng quy mô" },
]

export default function ProgramApplyForm({ programId, programName }) {
  const [open, setOpen]       = useState(false)
  const [step, setStep]       = useState(1) // 2 bước: thông tin cá nhân → thông tin startup
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState("")
  const [fieldErrors, setFieldErrors] = useState({})

  const [fields, setFields] = useState({
    applicantName:  "",
    applicantEmail: "",
    applicantPhone: "",
    startupName:    "",
    startupWebsite: "",
    startupDesc:    "",
    teamSize:       "1",
    industry:       "",
    stage:          "",
    fundingRaised:  "",
    pitchDeckUrl:   "",
    additionalInfo: "",
    website:        "", // honeypot
  })

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
      const payload = {
        ...fields,
        teamSize:     Number(fields.teamSize) || 1,
        fundingRaised: fields.fundingRaised ? Number(fields.fundingRaised) : undefined,
      }

      const res = await fetch(`/api/programs/${programId}/apply`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.fields) {
          setFieldErrors(data.fields)
          // Nếu lỗi ở step 1, quay lại step 1
          const step1Fields = ["applicantName", "applicantEmail", "applicantPhone"]
          if (step1Fields.some(f => data.fields[f])) setStep(1)
        } else {
          setError(data.error || "Đã xảy ra lỗi. Vui lòng thử lại.")
        }
      } else {
        setSuccess(true)
      }
    } catch {
      setError("Không thể kết nối. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"

  function FieldError({ name }) {
    return fieldErrors[name]
      ? <p className="text-red-500 text-xs mt-1">{fieldErrors[name][0]}</p>
      : null
  }

  // ── Trigger button ──────────────────────────────────────────────────────────
  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="w-full rounded-full font-bold h-11"
      >
        Đăng ký ngay <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    )
  }

  // ── Thành công ──────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-center">
        <p className="text-2xl mb-2">🎉</p>
        <p className="font-semibold text-green-800">Nộp đơn thành công!</p>
        <p className="text-sm text-green-700 mt-1">
          Chúng tôi sẽ xem xét và liên hệ trong 5–7 ngày làm việc.
        </p>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      {/* Header + step indicator */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base">Đăng ký: {programName}</h3>
        <span className="text-xs text-gray-400">Bước {step}/2</span>
      </div>

      {/* Honeypot ẩn */}
      <input
        name="website"
        value={fields.website}
        onChange={handleChange}
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
      />

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* ── Bước 1: Thông tin người liên hệ ── */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input name="applicantName" value={fields.applicantName} onChange={handleChange} required className={inputClass} placeholder="Nguyễn Văn A" />
              <FieldError name="applicantName" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input name="applicantEmail" type="email" value={fields.applicantEmail} onChange={handleChange} required className={inputClass} placeholder="email@example.com" />
              <FieldError name="applicantEmail" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input name="applicantPhone" type="tel" value={fields.applicantPhone} onChange={handleChange} required className={inputClass} placeholder="0901234567" />
              <FieldError name="applicantPhone" />
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => setOpen(false)}>Hủy</Button>
              <Button
                type="button"
                className="flex-1 rounded-full font-bold"
                onClick={() => {
                  if (!fields.applicantName || !fields.applicantEmail || !fields.applicantPhone) {
                    setError("Vui lòng điền đầy đủ thông tin bắt buộc.")
                    return
                  }
                  setError("")
                  setStep(2)
                }}
              >
                Tiếp theo →
              </Button>
            </div>
          </>
        )}

        {/* ── Bước 2: Thông tin startup ── */}
        {step === 2 && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên startup <span className="text-red-500">*</span>
              </label>
              <input name="startupName" value={fields.startupName} onChange={handleChange} required className={inputClass} placeholder="Tên công ty / dự án" />
              <FieldError name="startupName" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giai đoạn <span className="text-red-500">*</span>
                </label>
                <select name="stage" value={fields.stage} onChange={handleChange} required className={inputClass}>
                  <option value="">Chọn...</option>
                  {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <FieldError name="stage" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quy mô team <span className="text-red-500">*</span>
                </label>
                <input name="teamSize" type="number" min="1" max="100" value={fields.teamSize} onChange={handleChange} required className={inputClass} />
                <FieldError name="teamSize" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lĩnh vực <span className="text-red-500">*</span>
              </label>
              <input name="industry" value={fields.industry} onChange={handleChange} required className={inputClass} placeholder="Fintech, EdTech, HealthTech..." />
              <FieldError name="industry" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả startup <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal"> (tối thiểu 50 ký tự)</span>
              </label>
              <textarea name="startupDesc" value={fields.startupDesc} onChange={handleChange} required rows={3} className={`${inputClass} resize-none`} placeholder="Startup của bạn giải quyết vấn đề gì? Giải pháp là gì?" />
              <div className="flex justify-between">
                <FieldError name="startupDesc" />
                <span className="text-xs text-gray-400 ml-auto">{fields.startupDesc.length}/2000</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website startup</label>
              <input name="startupWebsite" type="url" value={fields.startupWebsite} onChange={handleChange} className={inputClass} placeholder="https://startup.com" />
              <FieldError name="startupWebsite" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Pitch Deck</label>
              <input name="pitchDeckUrl" type="url" value={fields.pitchDeckUrl} onChange={handleChange} className={inputClass} placeholder="https://drive.google.com/..." />
              <FieldError name="pitchDeckUrl" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin bổ sung</label>
              <textarea name="additionalInfo" value={fields.additionalInfo} onChange={handleChange} rows={2} className={`${inputClass} resize-none`} placeholder="Lý do muốn tham gia chương trình, kỳ vọng..." />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={() => setStep(1)} disabled={loading}>← Quay lại</Button>
              <Button type="submit" className="flex-1 rounded-full font-bold" disabled={loading}>
                {loading ? "Đang gửi..." : "Nộp đơn"}
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}