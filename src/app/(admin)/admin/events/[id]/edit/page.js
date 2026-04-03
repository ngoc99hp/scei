"use client"
// src/app/(admin)/admin/events/[id]/edit/page.js

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
  { value: "FULL",      label: "Hết chỗ" },
  { value: "ONGOING",   label: "Đang diễn ra" },
  { value: "COMPLETED", label: "Đã kết thúc" },
  { value: "CANCELLED", label: "Đã hủy" },
]
const TYPE_OPTIONS = [
  { value: "WORKSHOP",   label: "Workshop" },
  { value: "PITCHING",   label: "Pitching" },
  { value: "NETWORKING", label: "Networking" },
  { value: "SEMINAR",    label: "Seminar" },
  { value: "CONFERENCE", label: "Conference" },
  { value: "OTHER",      label: "Khác" },
]

function toDatetimeLocal(d) {
  if (!d) return ""
  const dt  = new Date(d)
  const pad = (n) => String(n).padStart(2, "0")
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

function slugify(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").replace(/-+/g, "-")
}

const INIT = {
  title: "", slug: "", type: "WORKSHOP", status: "DRAFT",
  shortDesc: "", description: "", content: "",
  coverImage: "",
  startDate: "", endDate: "", registerDeadline: "",
  location: "", isOnline: false, onlineLink: "",
  maxAttendees: "", tags: "",
  isPublished: false, isFeatured: false,
}

export default function EventEditPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const isNew    = id === "new"

  const [loading,  setLoading]  = useState(!isNew)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState("")
  const [success,  setSuccess]  = useState(false)
  const [fields,   setFields]   = useState(INIT)
  const [autoSlug, setAutoSlug] = useState(isNew)

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/events/${id}`)
      .then(r => r.json())
      .then(({ event: e }) => {
        if (e) setFields({
          title:            e.title             ?? "",
          slug:             e.slug              ?? "",
          type:             e.type              ?? "WORKSHOP",
          status:           e.status            ?? "DRAFT",
          shortDesc:        e.short_desc        ?? "",
          description:      e.description       ?? "",
          content:          e.content           ?? "",
          coverImage:       e.cover_image       ?? "",
          startDate:        toDatetimeLocal(e.start_date),
          endDate:          toDatetimeLocal(e.end_date),
          registerDeadline: toDatetimeLocal(e.register_deadline),
          location:         e.location          ?? "",
          isOnline:         e.is_online         ?? false,
          onlineLink:       e.online_link       ?? "",
          maxAttendees:     e.max_attendees?.toString() ?? "",
          tags:             (e.tags ?? []).join(", "),
          isPublished:      e.is_published      ?? false,
          isFeatured:       e.is_featured       ?? false,
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, isNew])

  function set(key, value) {
    setFields(prev => {
      const next = { ...prev, [key]: value }
      if (key === "title" && autoSlug) next.slug = slugify(value)
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
      title:            fields.title,
      slug:             fields.slug,
      type:             fields.type,
      status:           fields.status,
      shortDesc:        fields.shortDesc,
      description:      fields.description,
      content:          fields.content,
      coverImage:       fields.coverImage,
      startDate:        fields.startDate        || null,
      endDate:          fields.endDate          || null,
      registerDeadline: fields.registerDeadline || null,
      location:         fields.location,
      isOnline:         fields.isOnline,
      onlineLink:       fields.onlineLink,
      maxAttendees:     fields.maxAttendees ? Number(fields.maxAttendees) : null,
      tags:             fields.tags.split(",").map(t => t.trim()).filter(Boolean),
      isPublished:      fields.isPublished,
      isFeatured:       fields.isFeatured,
    }
    const url    = isNew ? "/api/admin/events"      : `/api/admin/events/${id}`
    const method = isNew ? "POST"                    : "PATCH"
    try {
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Lưu thất bại")
      else {
        setSuccess(true); setTimeout(() => setSuccess(false), 3000)
        if (isNew && data.event?.id) router.replace(`/admin/events/${data.event.id}/edit`)
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
          title={isNew ? "Tạo sự kiện mới" : "Chỉnh sửa sự kiện"}
          description={fields.slug ? `/${fields.slug}` : ""}
          backHref="/admin/events"
          actions={!isNew && fields.isPublished && fields.slug ? (
            <Link href={`/events/${fields.slug}`} target="_blank"
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ExternalLink size={14} /> Xem trang
            </Link>
          ) : null}
        />

        <div className="space-y-4">
          <FormSection title="Thông tin cơ bản">
            <Field label="Tiêu đề" required>
              <input name="title" value={fields.title} onChange={handleChange} className={inputCls} placeholder="Tên sự kiện..." />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug (URL)" hint="Tự động tạo từ tiêu đề khi tạo mới">
                <input name="slug" value={fields.slug} onChange={e => { setAutoSlug(false); set("slug", e.target.value) }} className={inputCls} />
              </Field>
              <Field label="Loại sự kiện">
                <select name="type" value={fields.type} onChange={handleChange} className={inputCls}>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Trạng thái">
                <select name="status" value={fields.status} onChange={handleChange} className={inputCls}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Số chỗ tối đa" hint="Để trống = không giới hạn">
                <input name="maxAttendees" type="number" min="1" value={fields.maxAttendees} onChange={handleChange} className={inputCls} placeholder="200" />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Ngày bắt đầu">
                <input name="startDate" type="datetime-local" value={fields.startDate} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="Ngày kết thúc">
                <input name="endDate" type="datetime-local" value={fields.endDate} onChange={handleChange} className={inputCls} />
              </Field>
              <Field label="Hạn đăng ký">
                <input name="registerDeadline" type="datetime-local" value={fields.registerDeadline} onChange={handleChange} className={inputCls} />
              </Field>
            </div>
            <Field label="Tags" hint="Phân cách bằng dấu phẩy">
              <input name="tags" value={fields.tags} onChange={handleChange} className={inputCls} placeholder="workshop, AI, startup" />
            </Field>
            <div className="flex items-center flex-wrap gap-5 pt-1">
              {[
                { name: "isOnline",    label: "Sự kiện online" },
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

          <FormSection title="Địa điểm / Hình thức">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Địa điểm (nếu offline)">
                <input name="location" value={fields.location} onChange={handleChange} className={inputCls} placeholder="GEM Center, TP.HCM" />
              </Field>
              <Field label="Link tham gia (nếu online)" hint="Zoom, Google Meet, YouTube Live...">
                <input name="onlineLink" value={fields.onlineLink} onChange={handleChange} className={inputCls} placeholder="https://meet.google.com/..." />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Ảnh bìa" description="Khuyến nghị 1200×675px (tỉ lệ 16:9)">
            <ImageUpload
              value={fields.coverImage}
              onChange={url => set("coverImage", url)}
              type="event"
              slug={fields.slug}
              aspect="landscape"
            />
          </FormSection>

          <FormSection title="Mô tả ngắn" description="Dùng cho card preview và SEO (plain text, tối đa 300 ký tự)">
            <textarea name="shortDesc" value={fields.shortDesc} onChange={handleChange}
              rows={3} maxLength={300} className={`${inputCls} resize-none`}
              placeholder="Tóm tắt ngắn gọn về sự kiện..." />
            <p className="text-xs text-muted-foreground text-right">{fields.shortDesc.length}/300</p>
          </FormSection>

          <FormSection title="Nội dung chi tiết" description="Hiển thị trên trang chi tiết sự kiện — hỗ trợ định dạng phong phú">
            <RichTextEditor
              value={fields.content}
              onChange={html => set("content", html)}
              placeholder="Mô tả chi tiết về sự kiện, chương trình, diễn giả..."
              minHeight={350}
            />
          </FormSection>
        </div>
      </div>

      <SaveBar saving={saving} success={success} error={error} onSave={handleSave} />
    </div>
  )
}