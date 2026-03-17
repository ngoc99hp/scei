"use client"
// src/app/(admin)/admin/resources/[id]/edit/page.js
// Dùng chung cho tạo mới (id="new") và edit

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ExternalLink, FileText, Link2 } from "lucide-react"
import {
  PageHeader, FormSection, Field, inputCls, SaveBar, PublishBadge,
} from "@/components/admin/admin-ui"
import { ImageUpload } from "@/components/admin/image-upload"

const TYPE_OPTIONS = [
  { value: "DOCUMENT",    label: "Tài liệu (PDF, Word...)" },
  { value: "VIDEO",       label: "Video" },
  { value: "TEMPLATE",    label: "Template" },
  { value: "GUIDE",       label: "Hướng dẫn" },
  { value: "TOOL",        label: "Công cụ / Tool" },
  { value: "OTHER",       label: "Khác" },
]

const CATEGORY_OPTIONS = [
  "Khởi nghiệp", "Đầu tư", "Marketing", "Công nghệ", "Pháp lý",
  "Tài chính", "Quản lý", "Thiết kế", "Khác",
]

function slugify(s) {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").replace(/-+/g, "-")
}

const INIT = {
  title: "", slug: "", description: "",
  type: "DOCUMENT",
  cover_image: "",
  file_url: "", external_url: "",
  category: "", tags: "",
  is_published: false, is_featured: false,
}

export default function ResourceEditPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const isNew   = id === "new"

  const [loading,   setLoading]  = useState(!isNew)
  const [saving,    setSaving]   = useState(false)
  const [error,     setError]    = useState("")
  const [success,   setSuccess]  = useState(false)
  const [fields,    setFields]   = useState(INIT)
  const [autoSlug,  setAutoSlug] = useState(isNew)
  // "file" | "url" — cách thêm tài nguyên
  const [linkMode,  setLinkMode] = useState("url")

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/resources/${id}`)
      .then(r => r.json())
      .then(({ resource: r }) => {
        if (r) {
          setFields({
            title:        r.title        ?? "",
            slug:         r.slug         ?? "",
            description:  r.description  ?? "",
            type:         r.type         ?? "DOCUMENT",
            cover_image:  r.cover_image  ?? "",
            file_url:     r.file_url     ?? "",
            external_url: r.external_url ?? "",
            category:     r.category     ?? "",
            tags:         (r.tags ?? []).join(", "),
            is_published: r.is_published ?? false,
            is_featured:  r.is_featured  ?? false,
          })
          // Xác định mode từ data hiện có
          setLinkMode(r.file_url ? "file" : "url")
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, isNew])

  function set(name, value) {
    setFields(prev => {
      const next = { ...prev, [name]: value }
      if (name === "title" && autoSlug) next.slug = slugify(value)
      return next
    })
  }
  function handleChange(e) {
    const { name, value, type, checked } = e.target
    set(name, type === "checkbox" ? checked : value)
  }

  async function handleSave() {
    setSaving(true); setError(""); setSuccess(false)
    // Đảm bảo chỉ gửi 1 trong 2: file_url hoặc external_url
    const body = {
      ...fields,
      tags: fields.tags.split(",").map(t => t.trim()).filter(Boolean),
      file_url:     linkMode === "file" ? fields.file_url     : "",
      external_url: linkMode === "url"  ? fields.external_url : "",
    }
    const url    = isNew ? "/api/admin/resources"      : `/api/admin/resources/${id}`
    const method = isNew ? "POST"                       : "PATCH"
    try {
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Lưu thất bại")
      else {
        setSuccess(true); setTimeout(() => setSuccess(false), 3000)
        if (isNew && data.resource?.id) router.replace(`/admin/resources/${data.resource.id}/edit`)
      }
    } catch { setError("Lỗi kết nối") }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="p-5 max-w-3xl mx-auto space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="p-5">
        <PageHeader
          title={isNew ? "Thêm tài nguyên mới" : "Chỉnh sửa tài nguyên"}
          description={fields.slug ? `/${fields.slug}` : ""}
          backHref="/admin/resources"
        />

        <div className="space-y-4">
          {/* Thông tin cơ bản */}
          <FormSection title="Thông tin cơ bản">
            <Field label="Tiêu đề" required>
              <input name="title" value={fields.title} onChange={handleChange} className={inputCls} placeholder="Tên tài nguyên..." />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug (URL)" hint="Tự động tạo từ tiêu đề">
                <input name="slug" value={fields.slug}
                  onChange={e => { setAutoSlug(false); set("slug", e.target.value) }}
                  className={inputCls} />
              </Field>
              <Field label="Loại tài nguyên">
                <select name="type" value={fields.type} onChange={handleChange} className={inputCls}>
                  {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Danh mục">
                <select name="category" value={fields.category} onChange={handleChange} className={inputCls}>
                  <option value="">— Chọn danh mục —</option>
                  {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Tags" hint="Phân cách bằng dấu phẩy">
                <input name="tags" value={fields.tags} onChange={handleChange} className={inputCls} placeholder="PDF, template, marketing" />
              </Field>
            </div>
            <Field label="Mô tả">
              <textarea name="description" value={fields.description} onChange={handleChange}
                rows={3} className={`${inputCls} resize-none`}
                placeholder="Mô tả ngắn về tài nguyên này..." />
            </Field>
            <div className="flex items-center gap-5 pt-1">
              {[
                { name: "is_published", label: "Đã publish" },
                { name: "is_featured",  label: "Nổi bật" },
              ].map(cb => (
                <label key={cb.name} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" name={cb.name} checked={fields[cb.name]} onChange={handleChange}
                    className="w-4 h-4 rounded border-input accent-primary" />
                  {cb.label}
                </label>
              ))}
            </div>
          </FormSection>

          {/* Link / File */}
          <FormSection title="Đường dẫn tài nguyên" description="Chọn cách cung cấp tài nguyên">
            {/* Toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden w-fit">
              <button type="button"
                onClick={() => setLinkMode("url")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm transition-colors ${linkMode === "url" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                <Link2 size={14} /> Link ngoài
              </button>
              <button type="button"
                onClick={() => setLinkMode("file")}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm transition-colors ${linkMode === "file" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
                <FileText size={14} /> URL file
              </button>
            </div>

            {linkMode === "url" ? (
              <Field label="External URL" hint="Link Google Drive, YouTube, website ngoài..." required>
                <input name="external_url" value={fields.external_url} onChange={handleChange}
                  className={inputCls} placeholder="https://drive.google.com/file/..." />
              </Field>
            ) : (
              <Field label="File URL" hint="URL trực tiếp đến file (PDF, DOCX...)" required>
                <input name="file_url" value={fields.file_url} onChange={handleChange}
                  className={inputCls} placeholder="https://res.cloudinary.com/scei/..." />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Upload file qua Cloudinary Media Library rồi copy URL vào đây.
                </p>
              </Field>
            )}
          </FormSection>

          {/* Ảnh thumbnail */}
          <FormSection title="Ảnh thumbnail" description="Ảnh hiển thị trong danh sách tài nguyên — khuyến nghị 800×600px">
            <ImageUpload
              value={fields.cover_image}
              onChange={url => set("cover_image", url)}
              type="resource"
              slug={fields.slug}
              aspect="landscape"
            />
          </FormSection>
        </div>
      </div>

      <SaveBar saving={saving} success={success} error={error} onSave={handleSave} />
    </div>
  )
}