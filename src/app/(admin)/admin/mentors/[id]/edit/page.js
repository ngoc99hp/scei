"use client"
// src/app/(admin)/admin/mentors/[id]/edit/page.js
// Dùng chung cho tạo mới (id="new") và edit

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import {
  PageHeader, FormSection, Field, inputCls, SaveBar,
} from "@/components/admin/admin-ui"
import { ImageUpload } from "@/components/admin/image-upload"

const STATUS_OPTIONS = [
  { value: "ACTIVE",   label: "Đang hoạt động" },
  { value: "INACTIVE", label: "Không hoạt động" },
]

const EXPERTISE_SUGGESTIONS = [
  "Product Management", "Business Development", "Marketing & Growth",
  "Investment & Fundraising", "Technology & Engineering", "Legal & Finance",
  "UX/UI Design", "Sales & Distribution", "Operations", "AI/ML",
]

function slugify(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").replace(/-+/g, "-")
}

const INIT = {
  name: "", slug: "",
  title: "", organization: "",
  expertise: "", bio: "", short_bio: "",
  email: "",
  linkedin_url: "", facebook_url: "", website: "",
  years_exp: "",
  avatar: "",
  tags: "",
  status: "ACTIVE",
  is_published: false, is_featured: false, display_order: 0,
}

export default function MentorEditPage() {
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
    fetch(`/api/admin/mentors/${id}`)
      .then(r => r.json())
      .then(({ mentor: m }) => {
        if (m) setFields({
          name:          m.name          ?? "",
          slug:          m.slug          ?? "",
          title:         m.title         ?? "",
          organization:  m.organization  ?? "",
          expertise:     m.expertise     ?? "",
          bio:           m.bio           ?? "",
          short_bio:     m.short_bio     ?? "",
          email:         m.email         ?? "",
          linkedin_url:  m.linkedin_url  ?? "",
          facebook_url:  m.facebook_url  ?? "",
          website:       m.website       ?? "",
          years_exp:     m.years_exp?.toString() ?? "",
          avatar:        m.avatar        ?? "",
          tags:          (m.tags ?? []).join(", "),
          status:        m.status        ?? "ACTIVE",
          is_published:  m.is_published  ?? false,
          is_featured:   m.is_featured   ?? false,
          display_order: m.display_order ?? 0,
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

  // Thêm/bỏ expertise tag
  function toggleExpertise(tag) {
    const current = fields.expertise ? fields.expertise.split(", ").filter(Boolean) : []
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag]
    set("expertise", updated.join(", "))
  }

  async function handleSave() {
    setSaving(true); setError(""); setSuccess(false)
    const body = {
      ...fields,
      tags: fields.tags.split(",").map(t => t.trim()).filter(Boolean),
      years_exp: fields.years_exp ? Number(fields.years_exp) : null,
      display_order: Number(fields.display_order) || 0,
    }
    const url    = isNew ? "/api/admin/mentors"      : `/api/admin/mentors/${id}`
    const method = isNew ? "POST"                     : "PATCH"
    try {
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Lưu thất bại")
      else {
        setSuccess(true); setTimeout(() => setSuccess(false), 3000)
        if (isNew && data.mentor?.id) router.replace(`/admin/mentors/${data.mentor.id}/edit`)
      }
    } catch { setError("Lỗi kết nối") }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="p-5 max-w-3xl mx-auto space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
    </div>
  )

  const expertiseCurrent = fields.expertise ? fields.expertise.split(", ").filter(Boolean) : []

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="p-5">
        <PageHeader
          title={isNew ? "Thêm mentor mới" : "Chỉnh sửa mentor"}
          description={fields.slug ? `/${fields.slug}` : ""}
          backHref="/admin/mentors"
          actions={!isNew && fields.is_published && fields.slug ? (
            <Link href={`/mentors/${fields.slug}`} target="_blank"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ExternalLink size={14} /> Xem trang
            </Link>
          ) : null}
        />

        <div className="space-y-4">
          {/* Avatar */}
          <FormSection title="Avatar" description="Ảnh đại diện — vuông, khuyến nghị 400×400px">
            <div className="max-w-50">
              <ImageUpload
                value={fields.avatar}
                onChange={url => set("avatar", url)}
                type="mentor"
                slug={fields.slug}
                aspect="square"
                hint="JPG/PNG, tối thiểu 400×400px"
              />
            </div>
          </FormSection>

          {/* Thông tin cơ bản */}
          <FormSection title="Thông tin cơ bản">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Họ tên" required>
                <input name="name" value={fields.name} onChange={handleChange} className={inputCls} placeholder="Dr. Nguyễn Văn A" />
              </Field>
              <Field label="Slug (URL)" hint="Tự động tạo từ tên">
                <input name="slug" value={fields.slug}
                  onChange={e => { setAutoSlug(false); set("slug", e.target.value) }}
                  className={inputCls} />
              </Field>
              <Field label="Chức danh">
                <input name="title" value={fields.title} onChange={handleChange} className={inputCls} placeholder="Partner, Co-founder, CEO..." />
              </Field>
              <Field label="Tổ chức / Công ty">
                <input name="organization" value={fields.organization} onChange={handleChange} className={inputCls} placeholder="Sequoia Capital SEA" />
              </Field>
              <Field label="Số năm kinh nghiệm">
                <input name="years_exp" type="number" min="0" value={fields.years_exp} onChange={handleChange} className={inputCls} placeholder="10" />
              </Field>
              <Field label="Trạng thái">
                <select name="status" value={fields.status} onChange={handleChange} className={inputCls}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tags" hint="Phân cách bằng dấu phẩy">
                <input name="tags" value={fields.tags} onChange={handleChange} className={inputCls} placeholder="investor, fintech, AI" />
              </Field>
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

          {/* Chuyên môn */}
          <FormSection title="Chuyên môn (Expertise)" description="Chọn nhanh hoặc gõ tự do">
            {/* Quick-pick tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {EXPERTISE_SUGGESTIONS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleExpertise(tag)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    expertiseCurrent.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
            <Field label="Expertise (text)" hint="Phân cách bằng dấy phẩy — chọn ở trên hoặc gõ tự do">
              <input name="expertise" value={fields.expertise} onChange={handleChange} className={inputCls}
                placeholder="Product Management, AI/ML, Fundraising" />
            </Field>
          </FormSection>

          {/* Bio */}
          <FormSection title="Giới thiệu">
            <Field label="Giới thiệu ngắn (short_bio)" hint="1-2 dòng, dùng trong card danh sách (tối đa 200 ký tự)">
              <textarea name="short_bio" value={fields.short_bio} onChange={handleChange}
                rows={2} maxLength={200} className={`${inputCls} resize-none`}
                placeholder="Investor với 15 năm kinh nghiệm tại Silicon Valley và Đông Nam Á." />
              <p className="text-xs text-muted-foreground text-right">{fields.short_bio.length}/200</p>
            </Field>
            <Field label="Bio đầy đủ" hint="Hiển thị trên trang chi tiết mentor">
              <textarea name="bio" value={fields.bio} onChange={handleChange}
                rows={5} className={`${inputCls} resize-none`}
                placeholder="Giới thiệu chi tiết về kinh nghiệm, thành tích, quan điểm đầu tư..." />
            </Field>
          </FormSection>

          {/* Liên hệ & Mạng xã hội */}
          <FormSection title="Liên hệ & Mạng xã hội">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email (nội bộ — không hiển thị)">
                <input name="email" type="email" value={fields.email} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="Website cá nhân">
                <input name="website" value={fields.website} onChange={handleChange} className={inputCls} placeholder="https://..." />
              </Field>
              <Field label="LinkedIn">
                <input name="linkedin_url" value={fields.linkedin_url} onChange={handleChange} className={inputCls} placeholder="https://linkedin.com/in/..." />
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