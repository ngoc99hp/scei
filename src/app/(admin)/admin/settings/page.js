"use client"
// src/app/(admin)/admin/settings/page.js

import { useState, useEffect } from "react"
import { Loader2, Globe, Mail, Phone, MapPin, Facebook, Linkedin, Youtube } from "lucide-react"
import { PageHeader, FormSection, Field, inputCls, SaveBar } from "@/components/admin/admin-ui"

// Danh sách keys cần quản lý — nếu chưa có trong DB sẽ tự tạo khi save
const SETTINGS_SCHEMA = [
  {
    section: "Thông tin chung",
    fields: [
      { key: "site_name",        label: "Tên website",      type: "text",     placeholder: "SCEI - Trung tâm Khởi nghiệp Đổi mới sáng tạo" },
      { key: "site_description", label: "Mô tả website",    type: "textarea", placeholder: "Mô tả ngắn về tổ chức..." },
      { key: "site_url",         label: "URL website",      type: "text",     placeholder: "https://scei.vn" },
      { key: "logo_url",         label: "Logo URL",         type: "text",     placeholder: "https://res.cloudinary.com/..." },
      { key: "favicon_url",      label: "Favicon URL",      type: "text",     placeholder: "https://..." },
    ],
  },
  {
    section: "Thông tin liên hệ",
    fields: [
      { key: "contact_email",   label: "Email liên hệ",   type: "text",  placeholder: "contact@scei.vn" },
      { key: "contact_phone",   label: "Số điện thoại",   type: "text",  placeholder: "028 xxxx xxxx" },
      { key: "contact_address", label: "Địa chỉ",         type: "textarea", placeholder: "Số x, Đường y, TP. Hồ Chí Minh" },
    ],
  },
  {
    section: "Mạng xã hội",
    fields: [
      { key: "social_facebook",  label: "Facebook",  type: "text", placeholder: "https://facebook.com/scei" },
      { key: "social_linkedin",  label: "LinkedIn",  type: "text", placeholder: "https://linkedin.com/company/scei" },
      { key: "social_youtube",   label: "YouTube",   type: "text", placeholder: "https://youtube.com/@scei" },
    ],
  },
  {
    section: "SEO mặc định",
    fields: [
      { key: "og_image",         label: "OG Image mặc định", type: "text",     placeholder: "https://scei.vn/og-default.png" },
      { key: "meta_keywords",    label: "Keywords mặc định", type: "text",     placeholder: "khởi nghiệp, startup, ươm tạo" },
      { key: "google_analytics", label: "Google Analytics ID", type: "text",   placeholder: "G-XXXXXXXXXX" },
    ],
  },
]

export default function SettingsPage() {
  const [values,  setValues]  = useState({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(data => {
        const init = {}
        // Flatten config { key: { value, label } } → { key: value }
        for (const [k, v] of Object.entries(data.config ?? {})) {
          init[k] = typeof v === "object" ? v.value : v
        }
        // Fill defaults for keys not yet in DB
        SETTINGS_SCHEMA.forEach(s => s.fields.forEach(f => {
          if (init[f.key] === undefined) init[f.key] = ""
        }))
        setValues(init)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true); setError(""); setSuccess(false)
    try {
      const res  = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Lưu thất bại")
      else { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
    } catch { setError("Lỗi kết nối") }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="p-5 max-w-2xl mx-auto space-y-4">
      {Array.from({length: 4}).map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="p-5">
        <PageHeader title="Cài đặt hệ thống" description="Thông tin tổ chức, liên hệ và SEO" />

        <div className="space-y-4">
          {SETTINGS_SCHEMA.map(section => (
            <FormSection key={section.section} title={section.section}>
              {section.fields.map(f => (
                <Field key={f.key} label={f.label}>
                  {f.type === "textarea" ? (
                    <textarea
                      value={values[f.key] ?? ""}
                      onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                      rows={3}
                      placeholder={f.placeholder}
                      className={`${inputCls} resize-none`}
                    />
                  ) : (
                    <input
                      type="text"
                      value={values[f.key] ?? ""}
                      onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className={inputCls}
                    />
                  )}
                </Field>
              ))}
            </FormSection>
          ))}
        </div>
      </div>

      <SaveBar saving={saving} success={success} error={error} onSave={handleSave} />
    </div>
  )
}