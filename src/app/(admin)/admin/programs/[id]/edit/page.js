"use client"
// src/app/(admin)/admin/programs/[id]/edit/page.js

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import {
  PageHeader, FormSection, Field, inputCls, SaveBar,
} from "@/components/admin/admin-ui"
import { ImageUpload } from "@/components/admin/image-upload"

const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor"),
  { ssr: false, loading: () => <div className="h-64 rounded-xl bg-muted animate-pulse" /> }
)

const STATUS_OPTIONS = [
  { value: "DRAFT",     label: "Nháp" },
  { value: "OPEN",      label: "Mở đăng ký" },
  { value: "CLOSED",    label: "Đã đóng" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
]
const TYPE_OPTIONS = [
  { value: "INCUBATION",   label: "Ươm tạo" },
  { value: "ACCELERATION", label: "Tăng tốc" },
  { value: "COWORKING",    label: "Co-working" },
]

function toDate(d) {
  if (!d) return ""
  return new Date(d).toISOString().split("T")[0]
}

function slugify(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").replace(/-+/g, "-")
}

const INIT = {
  name: "", slug: "", type: "INCUBATION", status: "DRAFT",
  shortDesc: "", description: "", content: "",
  coverImage: "",
  benefits: "", requirements: "",
  startDate: "", endDate: "", applyDeadline: "",
  maxApplicants: "",
  tags: "",
  isPublished: false, isFeatured: false, displayOrder: 0,
}

export default function ProgramEditPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const isNew   = id === "new"

  const [loading,   setLoading]   = useState(!isNew)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState("")
  const [success,   setSuccess]   = useState(false)
  const [fields,    setFields]    = useState(INIT)
  const [autoSlug,  setAutoSlug]  = useState(isNew)

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/programs/${id}`)
      .then(r => r.json())
      .then(({ program: p }) => {
        if (p) setFields({
          name:          p.name           ?? "",
          slug:          p.slug           ?? "",
          type:          p.type           ?? "INCUBATION",
          status:        p.status         ?? "DRAFT",
          shortDesc:     p.short_desc     ?? "",
          description:   p.description    ?? "",
          content:       p.content        ?? "",
          coverImage:    p.cover_image    ?? "",
          benefits:      p.benefits       ?? "",
          requirements:  p.requirements   ?? "",
          startDate:     toDate(p.start_date),
          endDate:       toDate(p.end_date),
          applyDeadline: toDate(p.apply_deadline),
          maxApplicants: p.max_applicants?.toString() ?? "",
          tags:          (p.tags ?? []).join(", "),
          isPublished:   p.is_published   ?? false,
          isFeatured:    p.is_featured    ?? false,
          displayOrder:  p.display_order  ?? 0,
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
      name:          fields.name,
      slug:          fields.slug,
      type:          fields.type,
      status:        fields.status,
      shortDesc:     fields.shortDesc,
      description:   fields.description,
      content:       fields.content,
      coverImage:    fields.coverImage,
      benefits:      fields.benefits,
      requirements:  fields.requirements,
      startDate:     fields.startDate     || null,
      endDate:       fields.endDate       || null,
      applyDeadline: fields.applyDeadline || null,
      maxApplicants: fields.maxApplicants ? Number(fields.maxApplicants) : null,
      tags:          fields.tags.split(",").map(t => t.trim()).filter(Boolean),
      isPublished:   fields.isPublished,
      isFeatured:    fields.isFeatured,
      displayOrder:  Number(fields.displayOrder) || 0,
    }
    const url    = isNew ? "/api/admin/programs"      : `/api/admin/programs/${id}`
    const method = isNew ? "POST"                      : "PATCH"
    try {
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Lưu thất bại")
      else {
        setSuccess(true); setTimeout(() => setSuccess(false), 3000)
        if (isNew && data.program?.id) router.replace(`/admin/programs/${data.program.id}/edit`)
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
          title={isNew ? "Tạo chương trình mới" : "Chỉnh sửa chương trình"}
          description={fields.slug ? `/${fields.slug}` : ""}
          backHref="/admin/programs"
          actions={!isNew && fields.isPublished && fields.slug ? (
            <Link href={`/programs/${fields.slug}`} target="_blank"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ExternalLink size={14} /> Xem trang
            </Link>
          ) : null}
        />

        <div className="space-y-4">
          {/* Thông tin cơ bản */}
          <FormSection title="Thông tin cơ bản">
            <Field label="Tên chương trình" required>
              <input name="name" value={fields.name} onChange={handleChange} className={inputCls} placeholder="Tên chương trình ươm tạo..." />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug (URL)" hint="Tự động tạo từ tên khi tạo mới">
                <input name="slug" value={fields.slug} onChange={e => { setAutoSlug(false); set("slug", e.target.value) }} className={inputCls} />
              </Field>
              <Field label="Loại chương trình">
                <select name="type" value={fields.type} onChange={handleChange} className={inputCls}>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Trạng thái">
                <select name="status" value={fields.status} onChange={handleChange} className={inputCls}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Số đơn tối đa" hint="Để trống = không giới hạn">
                <input name="maxApplicants" type="number" min="1" value={fields.maxApplicants} onChange={handleChange} className={inputCls} placeholder="50" />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Ngày bắt đầu">
                <input name="startDate" type="date" value={fields.startDate} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="Ngày kết thúc">
                <input name="endDate" type="date" value={fields.endDate} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="Hạn nộp đơn">
                <input name="applyDeadline" type="date" value={fields.applyDeadline} onChange={handleChange} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tags" hint="Phân cách bằng dấu phẩy">
                <input name="tags" value={fields.tags} onChange={handleChange} className={inputCls} placeholder="AI, fintech, startup" />
              </Field>
              <Field label="Thứ tự hiển thị" hint="Số nhỏ hơn hiển thị trước">
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

          {/* Ảnh bìa */}
          <FormSection title="Ảnh bìa" description="Khuyến nghị 1200×675px (tỉ lệ 16:9)">
            <ImageUpload
              value={fields.coverImage}
              onChange={url => set("coverImage", url)}
              type="program"
              slug={fields.slug}
              aspect="landscape"
            />
          </FormSection>

          {/* Mô tả ngắn */}
          <FormSection title="Mô tả ngắn" description="Dùng cho card preview và SEO (plain text, tối đa 300 ký tự)">
            <textarea name="shortDesc" value={fields.shortDesc} onChange={handleChange}
              rows={3} maxLength={300} className={`${inputCls} resize-none`}
              placeholder="Tóm tắt ngắn gọn về chương trình..." />
            <p className="text-xs text-muted-foreground text-right">{fields.shortDesc.length}/300</p>
          </FormSection>

          {/* Quyền lợi & Yêu cầu */}
          <FormSection title="Quyền lợi & Yêu cầu" description="Hiển thị trong trang đăng ký — dùng plain text hoặc danh sách đơn giản">
            <Field label="Quyền lợi tham gia (benefits)" hint="Mỗi dòng một quyền lợi, hoặc viết tự do">
              <textarea name="benefits" value={fields.benefits} onChange={handleChange}
                rows={4} className={`${inputCls} resize-none`}
                placeholder={"- Nhận hỗ trợ tài chính lên đến 50 triệu đồng\n- Kết nối với mạng lưới 200+ mentor\n- Văn phòng làm việc miễn phí 6 tháng"} />
            </Field>
            <Field label="Yêu cầu đăng ký (requirements)" hint="Điều kiện để tham gia chương trình">
              <textarea name="requirements" value={fields.requirements} onChange={handleChange}
                rows={4} className={`${inputCls} resize-none`}
                placeholder={"- Startup giai đoạn pre-seed hoặc seed\n- Ít nhất 2 thành viên founding team\n- Có MVP hoặc prototype"} />
            </Field>
          </FormSection>

          {/* Nội dung chi tiết */}
          <FormSection title="Nội dung chi tiết" description="Hiển thị trên trang chi tiết chương trình — hỗ trợ định dạng phong phú">
            <RichTextEditor
              value={fields.content}
              onChange={html => set("content", html)}
              placeholder="Giới thiệu chương trình, lịch trình, quy trình tuyển chọn..."
              minHeight={350}
            />
          </FormSection>
        </div>
      </div>

      <SaveBar saving={saving} success={success} error={error} onSave={handleSave} />
    </div>
  )
}