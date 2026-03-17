"use client"
// src/app/(admin)/admin/startups/[id]/edit/page.js
// Dùng chung cho tạo mới (id="new") và edit

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import {
  PageHeader, FormSection, Field, inputCls, SaveBar,
} from "@/components/admin/admin-ui"
import { ImageUpload } from "@/components/admin/image-upload"

const STAGE_OPTIONS = [
  { value: "IDEA",        label: "Idea" },
  { value: "MVP",         label: "MVP" },
  { value: "EARLY",       label: "Early Stage" },
  { value: "GROWTH",      label: "Growth" },
  { value: "SCALE",       label: "Scale" },
]
const STATUS_OPTIONS = [
  { value: "INCUBATING",   label: "Đang ươm tạo" },
  { value: "ACCELERATING", label: "Đang tăng tốc" },
  { value: "GRADUATED",    label: "Đã tốt nghiệp" },
  { value: "INACTIVE",     label: "Không hoạt động" },
]
const INDUSTRY_OPTIONS = [
  "Fintech", "Edtech", "Healthtech", "Agritech", "Logistics", "E-commerce",
  "AI/ML", "SaaS", "Cleantech", "Proptech", "Foodtech", "Khác",
]

function slugify(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").replace(/-+/g, "-")
}

const INIT = {
  name: "", slug: "", tagline: "", description: "",
  website: "",
  industry: "", stage: "IDEA", status: "INCUBATING",
  founded_year: "", team_size: "", funding_raised: "",
  logo: "", cover_image: "",
  founder_name: "", founder_email: "", founder_linkedin: "",
  linkedin_url: "", facebook_url: "",
  tags: "",
  is_published: false, is_featured: false, display_order: 0,
}

export default function StartupEditPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const isNew   = id === "new"

  const [loading,  setLoading]  = useState(!isNew)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState("")
  const [success,  setSuccess]  = useState(false)
  const [fields,   setFields]   = useState(INIT)
  const [autoSlug, setAutoSlug] = useState(isNew)

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/startups/${id}`)
      .then(r => r.json())
      .then(({ startup: s }) => {
        if (s) setFields({
          name:             s.name             ?? "",
          slug:             s.slug             ?? "",
          tagline:          s.tagline          ?? "",
          description:      s.description      ?? "",
          website:          s.website          ?? "",
          industry:         s.industry         ?? "",
          stage:            s.stage            ?? "IDEA",
          status:           s.status           ?? "INCUBATING",
          founded_year:     s.founded_year?.toString() ?? "",
          team_size:        s.team_size?.toString()    ?? "",
          funding_raised:   s.funding_raised   ?? "",
          logo:             s.logo             ?? "",
          cover_image:      s.cover_image      ?? "",
          founder_name:     s.founder_name     ?? "",
          founder_email:    s.founder_email    ?? "",
          founder_linkedin: s.founder_linkedin ?? "",
          linkedin_url:     s.linkedin_url     ?? "",
          facebook_url:     s.facebook_url     ?? "",
          tags:             (s.tags ?? []).join(", "),
          is_published:     s.is_published     ?? false,
          is_featured:      s.is_featured      ?? false,
          display_order:    s.display_order    ?? 0,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, isNew])

  function set(name, value) {
    setFields(prev => {
      const next = { ...prev, [name]: value }
      if (name === "name" && autoSlug) next.slug = slugify(value)
      return next
    })
  }
  function handleChange(e) {
    const { name, value, type, checked } = e.target
    set(name, type === "checkbox" ? checked : value)
  }

  async function handleSave() {
    setSaving(true); setError(""); setSuccess(false)
    const body = {
      ...fields,
      tags: fields.tags.split(",").map(t => t.trim()).filter(Boolean),
      founded_year:  fields.founded_year  ? Number(fields.founded_year)  : null,
      team_size:     fields.team_size     ? Number(fields.team_size)     : null,
      display_order: Number(fields.display_order) || 0,
    }
    const url    = isNew ? "/api/admin/startups"      : `/api/admin/startups/${id}`
    const method = isNew ? "POST"                      : "PATCH"
    try {
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Lưu thất bại")
      else {
        setSuccess(true); setTimeout(() => setSuccess(false), 3000)
        if (isNew && data.startup?.id) router.replace(`/admin/startups/${data.startup.id}/edit`)
      }
    } catch { setError("Lỗi kết nối") }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="p-5 max-w-4xl mx-auto space-y-4">
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="p-5">
        <PageHeader
          title={isNew ? "Thêm startup mới" : "Chỉnh sửa startup"}
          description={fields.slug ? `/${fields.slug}` : ""}
          backHref="/admin/startups"
          actions={!isNew && fields.is_published && fields.slug ? (
            <Link href={`/startups/${fields.slug}`} target="_blank"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ExternalLink size={14} /> Xem trang
            </Link>
          ) : null}
        />

        <div className="space-y-4">
          {/* Thông tin cơ bản */}
          <FormSection title="Thông tin startup">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tên startup" required>
                <input name="name" value={fields.name} onChange={handleChange} className={inputCls} placeholder="Tên startup..." />
              </Field>
              <Field label="Slug (URL)" hint="Tự động tạo từ tên khi tạo mới">
                <input name="slug" value={fields.slug}
                  onChange={e => { setAutoSlug(false); set("slug", e.target.value) }}
                  className={inputCls} />
              </Field>
            </div>
            <Field label="Tagline" hint="Câu mô tả ngắn, 1 dòng">
              <input name="tagline" value={fields.tagline} onChange={handleChange} className={inputCls} placeholder="Giải pháp X cho vấn đề Y" />
            </Field>
            <Field label="Mô tả chi tiết">
              <textarea name="description" value={fields.description} onChange={handleChange}
                rows={4} className={`${inputCls} resize-none`}
                placeholder="Mô tả đầy đủ về startup, sản phẩm, thị trường..." />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Ngành">
                <select name="industry" value={fields.industry} onChange={handleChange} className={inputCls}>
                  <option value="">— Chọn ngành —</option>
                  {INDUSTRY_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </Field>
              <Field label="Website">
                <input name="website" value={fields.website} onChange={handleChange} className={inputCls} placeholder="https://..." />
              </Field>
              <Field label="Giai đoạn">
                <select name="stage" value={fields.stage} onChange={handleChange} className={inputCls}>
                  {STAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Trạng thái trong SCEI">
                <select name="status" value={fields.status} onChange={handleChange} className={inputCls}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Năm thành lập">
                <input name="founded_year" type="number" min="2000" max="2030" value={fields.founded_year} onChange={handleChange} className={inputCls} placeholder="2023" />
              </Field>
              <Field label="Quy mô team">
                <input name="team_size" type="number" min="1" value={fields.team_size} onChange={handleChange} className={inputCls} placeholder="5" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Vốn đã huy động" hint="VD: $200K, 2 tỷ VND">
                <input name="funding_raised" value={fields.funding_raised} onChange={handleChange} className={inputCls} placeholder="$200K" />
              </Field>
              <Field label="Tags" hint="Phân cách bằng dấu phẩy">
                <input name="tags" value={fields.tags} onChange={handleChange} className={inputCls} placeholder="AI, fintech, B2B" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Thứ tự hiển thị">
                <input name="display_order" type="number" min="0" value={fields.display_order} onChange={handleChange} className={inputCls} />
              </Field>
            </div>
            <div className="flex items-center gap-5 pt-1">
              {[
                { name: "is_published", label: "Đã publish" },
                { name: "is_featured",  label: "Nổi bật (trang chủ)" },
              ].map(cb => (
                <label key={cb.name} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" name={cb.name} checked={fields[cb.name]} onChange={handleChange}
                    className="w-4 h-4 rounded border-input accent-primary" />
                  {cb.label}
                </label>
              ))}
            </div>
          </FormSection>

          {/* Media — 2 uploads side by side */}
          <FormSection title="Media" description="Logo và ảnh bìa của startup">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Logo <span className="font-normal">(vuông, 200×200px)</span></p>
                <ImageUpload
                  value={fields.logo}
                  onChange={url => set("logo", url)}
                  type="startup"
                  slug={fields.slug ? `${fields.slug}-logo` : ""}
                  aspect="square"
                  hint="PNG với nền trong suốt, tối thiểu 200×200px"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Ảnh bìa <span className="font-normal">(16:9, 1200×675px)</span></p>
                <ImageUpload
                  value={fields.cover_image}
                  onChange={url => set("cover_image", url)}
                  type="startup"
                  slug={fields.slug ? `${fields.slug}-cover` : ""}
                  aspect="landscape"
                />
              </div>
            </div>
          </FormSection>

          {/* Thông tin founder */}
          <FormSection title="Thông tin Founder" description="Không bắt buộc — hiển thị trên trang chi tiết startup">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Họ tên founder">
                <input name="founder_name" value={fields.founder_name} onChange={handleChange} className={inputCls} placeholder="Nguyễn Văn A" />
              </Field>
              <Field label="Email founder">
                <input name="founder_email" type="email" value={fields.founder_email} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="LinkedIn founder">
                <input name="founder_linkedin" value={fields.founder_linkedin} onChange={handleChange} className={inputCls} placeholder="https://linkedin.com/in/..." />
              </Field>
            </div>
          </FormSection>

          {/* Mạng xã hội startup */}
          <FormSection title="Mạng xã hội">
            <div className="grid grid-cols-2 gap-4">
              <Field label="LinkedIn">
                <input name="linkedin_url" value={fields.linkedin_url} onChange={handleChange} className={inputCls} placeholder="https://linkedin.com/company/..." />
              </Field>
              <Field label="Facebook">
                <input name="facebook_url" value={fields.facebook_url} onChange={handleChange} className={inputCls} placeholder="https://facebook.com/..." />
              </Field>
            </div>
          </FormSection>
        </div>
      </div>

      <SaveBar saving={saving} success={success} error={error} onSave={handleSave} />
    </div>
  )
}