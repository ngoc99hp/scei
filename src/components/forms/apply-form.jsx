"use client"
// src/components/forms/apply-form.jsx
// Form nộp đơn tham gia chương trình — gọi POST /api/programs/[id]/apply
// Props: programId (string), programName (string)

import { useState } from "react"

const STAGES = [
  { value: "IDEA",     label: "Ý tưởng" },
  { value: "MVP",      label: "MVP" },
  { value: "SEED",     label: "Seed" },
  { value: "SERIES_A", label: "Series A" },
  { value: "GROWTH",   label: "Tăng trưởng" },
  { value: "SCALE",    label: "Quy mô hóa" },
]

const STEPS = ["Thông tin cá nhân", "Thông tin startup", "Xem lại & Gửi"]

export default function ApplyForm({ programId, programName }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    applicantName: "", applicantEmail: "", applicantPhone: "",
    startupName: "", startupWebsite: "", startupDesc: "",
    teamSize: "", industry: "", stage: "",
    fundingRaised: "", pitchDeckUrl: "", additionalInfo: "",
    website: "", // honeypot
  })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState("idle")
  const [serverMessage, setServerMessage] = useState("")

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  // Validate từng step trước khi next
  function validateStep(s) {
    const errs = {}
    if (s === 0) {
      if (!form.applicantName.trim()) errs.applicantName = ["Vui lòng nhập họ tên"]
      if (!form.applicantEmail.trim()) errs.applicantEmail = ["Vui lòng nhập email"]
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicantEmail)) errs.applicantEmail = ["Email không hợp lệ"]
      if (!form.applicantPhone.trim()) errs.applicantPhone = ["Vui lòng nhập số điện thoại"]
    }
    if (s === 1) {
      if (!form.startupName.trim()) errs.startupName = ["Vui lòng nhập tên startup"]
      if (!form.startupDesc.trim() || form.startupDesc.length < 50) errs.startupDesc = ["Mô tả tối thiểu 50 ký tự"]
      if (!form.industry.trim()) errs.industry = ["Vui lòng nhập lĩnh vực"]
      if (!form.stage) errs.stage = ["Vui lòng chọn giai đoạn"]
      if (!form.teamSize || isNaN(Number(form.teamSize))) errs.teamSize = ["Vui lòng nhập số thành viên"]
    }
    return errs
  }

  function handleNext() {
    const errs = validateStep(step)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setStep(s => s + 1)
  }

  async function handleSubmit() {
    setStatus("loading")
    setErrors({})
    setServerMessage("")

    try {
      const payload = {
        ...form,
        teamSize: Number(form.teamSize),
        fundingRaised: form.fundingRaised ? Number(form.fundingRaised) : undefined,
      }

      const res = await fetch(`/api/programs/${programId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus("success")
        setServerMessage(data.message)
      } else if (res.status === 422 && data.fields) {
        setStatus("idle")
        setErrors(data.fields)
        setStep(0) // Quay lại bước đầu nếu server trả lỗi
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
      <div className="rounded-2xl bg-green-50 border border-green-200 p-10 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Nộp đơn thành công!</h3>
        <p className="text-sm text-green-700 max-w-md mx-auto">{serverMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Honeypot */}
      <input type="text" name="website" value={form.website} onChange={handleChange}
        tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={[
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
              i < step ? "bg-green-500 text-white"
                : i === step ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-500"
            ].join(" ")}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={[
              "text-xs font-medium hidden sm:block",
              i === step ? "text-blue-600" : "text-gray-400"
            ].join(" ")}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={["h-0.5 flex-1", i < step ? "bg-green-400" : "bg-gray-200"].join(" ")} />
            )}
          </div>
        ))}
      </div>

      {/* Server error */}
      {status === "error" && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverMessage}
        </div>
      )}

      {/* Step 0: Thông tin cá nhân */}
      {step === 0 && (
        <div className="space-y-4">
          <Field label="Họ và tên người đại diện" required error={errors.applicantName?.[0]}>
            <input name="applicantName" value={form.applicantName} onChange={handleChange}
              placeholder="Nguyễn Văn A" className={inputCls(errors.applicantName)} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" required error={errors.applicantEmail?.[0]}>
              <input type="email" name="applicantEmail" value={form.applicantEmail} onChange={handleChange}
                placeholder="email@startup.com" className={inputCls(errors.applicantEmail)} />
            </Field>
            <Field label="Số điện thoại" required error={errors.applicantPhone?.[0]}>
              <input type="tel" name="applicantPhone" value={form.applicantPhone} onChange={handleChange}
                placeholder="0901 234 567" className={inputCls(errors.applicantPhone)} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 1: Thông tin startup */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tên startup" required error={errors.startupName?.[0]}>
              <input name="startupName" value={form.startupName} onChange={handleChange}
                placeholder="Tên startup" className={inputCls(errors.startupName)} />
            </Field>
            <Field label="Website" error={errors.startupWebsite?.[0]}>
              <input name="startupWebsite" value={form.startupWebsite} onChange={handleChange}
                placeholder="https://startup.com" className={inputCls(errors.startupWebsite)} />
            </Field>
          </div>
          <Field label="Mô tả startup" required error={errors.startupDesc?.[0]}>
            <textarea name="startupDesc" value={form.startupDesc} onChange={handleChange}
              rows={4} placeholder="Mô tả sản phẩm/dịch vụ, vấn đề giải quyết, thị trường mục tiêu... (tối thiểu 50 ký tự)"
              className={inputCls(errors.startupDesc)} />
            <span className="text-xs text-gray-400 self-end">{form.startupDesc.length}/2000</span>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Lĩnh vực" required error={errors.industry?.[0]}>
              <input name="industry" value={form.industry} onChange={handleChange}
                placeholder="VD: Fintech, Edtech..." className={inputCls(errors.industry)} />
            </Field>
            <Field label="Giai đoạn" required error={errors.stage?.[0]}>
              <select name="stage" value={form.stage} onChange={handleChange} className={inputCls(errors.stage)}>
                <option value="">-- Chọn --</option>
                {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Số thành viên" required error={errors.teamSize?.[0]}>
              <input type="number" name="teamSize" value={form.teamSize} onChange={handleChange}
                min={1} placeholder="VD: 3" className={inputCls(errors.teamSize)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Vốn đã huy động (USD)" error={errors.fundingRaised?.[0]}>
              <input type="number" name="fundingRaised" value={form.fundingRaised} onChange={handleChange}
                min={0} placeholder="VD: 50000 (bỏ trống nếu chưa có)" className={inputCls(errors.fundingRaised)} />
            </Field>
            <Field label="Pitch deck URL" error={errors.pitchDeckUrl?.[0]}>
              <input name="pitchDeckUrl" value={form.pitchDeckUrl} onChange={handleChange}
                placeholder="https://drive.google.com/..." className={inputCls(errors.pitchDeckUrl)} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 2: Xem lại */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-5 space-y-3 text-sm">
            <h4 className="font-semibold text-gray-700 text-base">Thông tin đăng ký</h4>
            <ReviewRow label="Chương trình" value={programName} />
            <ReviewRow label="Họ tên" value={form.applicantName} />
            <ReviewRow label="Email" value={form.applicantEmail} />
            <ReviewRow label="Điện thoại" value={form.applicantPhone} />
            <hr className="border-gray-200" />
            <ReviewRow label="Tên startup" value={form.startupName} />
            <ReviewRow label="Lĩnh vực" value={form.industry} />
            <ReviewRow label="Giai đoạn" value={STAGES.find(s => s.value === form.stage)?.label} />
            <ReviewRow label="Số thành viên" value={form.teamSize} />
            {form.startupWebsite && <ReviewRow label="Website" value={form.startupWebsite} />}
            {form.pitchDeckUrl && <ReviewRow label="Pitch deck" value={form.pitchDeckUrl} />}
          </div>
          <Field label="Thông tin bổ sung" error={errors.additionalInfo?.[0]}>
            <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleChange}
              rows={3} placeholder="Thông tin thêm bạn muốn chia sẻ (không bắt buộc)"
              className={inputCls(errors.additionalInfo)} />
          </Field>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between gap-3 pt-2">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(s => s - 1)}
            className="rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-5 transition-colors">
            ← Quay lại
          </button>
        ) : <div />}

        {step < STEPS.length - 1 ? (
          <button type="button" onClick={handleNext}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 transition-colors">
            Tiếp theo →
          </button>
        ) : (
          <button type="button" onClick={handleSubmit}
            disabled={status === "loading"}
            className="rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-2.5 px-6 transition-colors">
            {status === "loading" ? "Đang gửi..." : "🚀 Nộp đơn"}
          </button>
        )}
      </div>
    </div>
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

function ReviewRow({ label, value }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-32 flex-shrink-0">{label}:</span>
      <span className="text-gray-800 font-medium">{value || "—"}</span>
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