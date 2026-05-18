"use client"
// src/app/(admin)/admin/startups/[id]/edit/page.js

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import {
  PageHeader, FormSection, Field, inputCls, SaveBar,
} from "@/components/admin/admin-ui"
import { ImageUpload } from "@/components/admin/image-upload"

const STAGE_OPTIONS = [
  { value: "IDEA",   label: "Idea" },
  { value: "MVP",    label: "MVP" },
  { value: "EARLY",  label: "Early Stage" },
  { value: "GROWTH", label: "Growth" },
  { value: "SCALE",  label: "Scale" },
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
  foundedYear: "", teamSize: "", fundingRaised: "",
  logo: "", coverImage: "",
  founderName: "", founderEmail: "", founderLinkedin: "",
  linkedinUrl: "", facebookUrl: "",
  tags: "",
  isPublished: false, isFeatured: false, displayOrder: 0,
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
          name:            s.name             ?? "",
          slug:            s.slug             ?? "",
          tagline:         s.tagline          ?? "",
          description:     s.description      ?? "",
          website:         s.website          ?? "",
          industry:        s.industry         ?? "",
          stage:           ({ SEED: "EARLY", SERIES_A: "GROWTH" }[s.stage] ?? s.stage) ?? "IDEA",
          status:          s.status           ?? "INCUBATING",
          foundedYear:     s.founded_year?.toString()  ?? "",
          teamSize:        s.team_size?.toString()     ?? "",
          fundingRaised:   s.funding_raised?.toString()  ?? "",
          logo:            s.logo             ?? "",
          coverImage:      s.cover_image      ?? "",
          founderName:     s.founder_name     ?? "",
          founderEmail:    s.founder_email    ?? "",
          founderLinkedin: s.founder_linkedin ?? "",
          linkedinUrl:     s.linkedin_url     ?? "",
          facebookUrl:     s.facebook_url     ?? "",
          tags:            (s.tags ?? []).join(", "),
          isPublished:     s.is_published     ?? false,
          isFeatured:      s.is_featured      ?? false,
          displayOrder:    s.display_order    ?? 0,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, isNew])

  function set(key, value) {
    setFields(prev => {
      const next = { ...prev, [key]: value }
      if (key === "name" && autoSlug) next.slug = slugify(value)
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
      name:            fields.name,
      slug:            fields.slug,
      tagline:         fields.tagline,
      description:     fields.description,
      website:         fields.website,
      industry:        fields.industry,
      stage:           fields.stage,
      status:          fields.status,
      foundedYear:     fields.foundedYear  ? Number(fields.foundedYear)  : null,
      teamSize:        fields.teamSize     ? Number(fields.teamSize)     : null,
      fundingRaised:   fields.fundingRaised,
      logo:            fields.logo,
      coverImage:      fields.coverImage,
      founderName:     fields.founderName,
      founderEmail:    fields.founderEmail,
      founderLinkedin: fields.founderLinkedin,
      linkedinUrl:     fields.linkedinUrl,
      facebookUrl:     fields.facebookUrl,
      tags:            fields.tags.split(",").map(t => t.trim()).filter(Boolean),
      isPublished:     fields.isPublished,
      isFeatured:      fields.isFeatured,
      displayOrder:    Number(fields.displayOrder) || 0,
    }
    const url    = isNew ? "/api/admin/startups"      : `/api/admin/startups/${id}`
    const method = isNew ? "POST"                      : "PATCH"
    try {
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) {
        const detail = data.details
          ? " — " + Object.entries(data.details).map(([k, v]) => `${k}: ${v.join(", ")}`).join(" | ")
          : ""
        setError((data.error || "Lưu thất bại") + detail)
      } else {
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
          actions={!isNew && fields.isPublished && fields.slug ? (
            <Link href={`/startups/${fields.slug}`} target="_blank"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ExternalLink size={14} /> Xem trang
            </Link>
          ) : null}
        />

        <div className="space-y-4">
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
                <input name="foundedYear" type="number" min="2000" max="2030" value={fields.foundedYear} onChange={handleChange} className={inputCls} placeholder="2023" />
              </Field>
              <Field label="Quy mô team">
                <input name="teamSize" type="number" min="1" value={fields.teamSize} onChange={handleChange} className={inputCls} placeholder="5" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Vốn đã huy động" hint="VD: $200K, 2 tỷ VND">
                <input name="fundingRaised" value={fields.fundingRaised} onChange={handleChange} className={inputCls} placeholder="$200K" />
              </Field>
              <Field label="Tags" hint="Phân cách bằng dấu phẩy">
                <input name="tags" value={fields.tags} onChange={handleChange} className={inputCls} placeholder="AI, fintech, B2B" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Thứ tự hiển thị">
                <input name="displayOrder" type="number" min="0" value={fields.displayOrder} onChange={handleChange} className={inputCls} />
              </Field>
            </div>
            <div className="flex items-center gap-5 pt-1">
              {[
                { name: "isPublished", label: "Đã publish" },
                { name: "isFeatured",  label: "Nổi bật (trang chủ)" },
              ].map(cb => (
                <label key={cb.name} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" name={cb.name} checked={fields[cb.name]} onChange={handleChange}
                    className="w-4 h-4 rounded border-input accent-primary" />
                  {cb.label}
                </label>
              ))}
            </div>
          </FormSection>

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
                  value={fields.coverImage}
                  onChange={url => set("coverImage", url)}
                  type="startup"
                  slug={fields.slug ? `${fields.slug}-cover` : ""}
                  aspect="landscape"
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Thông tin Founder" description="Không bắt buộc — hiển thị trên trang chi tiết startup">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Họ tên founder">
                <input name="founderName" value={fields.founderName} onChange={handleChange} className={inputCls} placeholder="Nguyễn Văn A" />
              </Field>
              <Field label="Email founder">
                <input name="founderEmail" type="email" value={fields.founderEmail} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="LinkedIn founder">
                <input name="founderLinkedin" value={fields.founderLinkedin} onChange={handleChange} className={inputCls} placeholder="https://linkedin.com/in/..." />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Mạng xã hội">
            <div className="grid grid-cols-2 gap-4">
              <Field label="LinkedIn">
                <input name="linkedinUrl" value={fields.linkedinUrl} onChange={handleChange} className={inputCls} placeholder="https://linkedin.com/company/..." />
              </Field>
              <Field label="Facebook">
                <input name="facebookUrl" value={fields.facebookUrl} onChange={handleChange} className={inputCls} placeholder="https://facebook.com/..." />
              </Field>
            </div>
          </FormSection>
        </div>
      </div>

      <SaveBar saving={saving} success={success} error={error} onSave={handleSave} />
    </div>
  )
}