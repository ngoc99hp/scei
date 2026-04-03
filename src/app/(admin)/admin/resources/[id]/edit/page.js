"use client"
// src/app/(admin)/admin/resources/[id]/edit/page.js

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { FileText, Link2 } from "lucide-react"
import {
  PageHeader, FormSection, Field, inputCls, SaveBar,
} from "@/components/admin/admin-ui"
import { ImageUpload } from "@/components/admin/image-upload"

const TYPE_OPTIONS = [
  { value: "DOCUMENT", label: "Tài liệu (PDF, Word...)" },
  { value: "VIDEO",    label: "Video" },
  { value: "TEMPLATE", label: "Template" },
  { value: "GUIDE",    label: "Hướng dẫn" },
  { value: "TOOL",     label: "Công cụ / Tool" },
  { value: "OTHER",    label: "Khác" },
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
  coverImage: "",
  fileUrl: "", externalUrl: "",
  category: "", tags: "",
  isPublished: false, isFeatured: false,
}

export default function ResourceEditPage() {
  const { id }  = useParams()
  const router  = useRouter()
  const isNew   = id === "new"

  const [loading,  setLoading]  = useState(!isNew)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState("")
  const [success,  setSuccess]  = useState(false)
  const [fields,   setFields]   = useState(INIT)
  const [autoSlug, setAutoSlug] = useState(isNew)
  const [linkMode, setLinkMode] = useState("url") // "file" | "url"

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/resources/${id}`)
      .then(r => r.json())
      .then(({ resource: r }) => {
        if (r) {
          setFields({
            title:       r.title        ?? "",
            slug:        r.slug         ?? "",
            description: r.description  ?? "",
            type:        r.type         ?? "DOCUMENT",
            coverImage:  r.cover_image  ?? "",
            fileUrl:     r.file_url     ?? "",
            externalUrl: r.external_url ?? "",
            category:    r.category     ?? "",
            tags:        (r.tags ?? []).join(", "),
            isPublished: r.is_published ?? false,
            isFeatured:  r.is_featured  ?? false,
          })
          setLinkMode(r.file_url ? "file" : "url")
        }
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
      title:       fields.title,
      slug:        fields.slug,
      description: fields.description,
      type:        fields.type,
      coverImage:  fields.coverImage,
      fileUrl:     linkMode === "file" ? fields.fileUrl     : "",
      externalUrl: linkMode === "url"  ? fields.externalUrl : "",
      category:    fields.category,
      tags:        fields.tags.split(",").map(t => t.trim()).filter(Boolean),
      isPublished: fields.isPublished,
      isFeatured:  fields.isFeatured,
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
                { name: "isPublished", label: "Đã publish" },
                { name: "isFeatured",  label: "Nổi bật" },
              ].map(cb => (
                <label key={cb.name} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" name={cb.name} checked={fields[cb.name]} onChange={handleChange}
                    className="w-4 h-4 rounded border-input accent-primary" />
                  {cb.label}
                </label>
              ))}
            </div>
          </FormSection>

          <FormSection title="Đường dẫn tài nguyên" description="Chọn cách cung cấp tài nguyên">
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
                <input name="externalUrl" value={fields.externalUrl} onChange={handleChange}
                  className={inputCls} placeholder="https://drive.google.com/file/..." />
              </Field>
            ) : (
              <Field label="File URL" hint="URL trực tiếp đến file (PDF, DOCX...)" required>
                <input name="fileUrl" value={fields.fileUrl} onChange={handleChange}
                  className={inputCls} placeholder="https://res.cloudinary.com/scei/..." />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Upload file qua Cloudinary Media Library rồi copy URL vào đây.
                </p>
              </Field>
            )}
          </FormSection>

          <FormSection title="Ảnh thumbnail" description="Ảnh hiển thị trong danh sách tài nguyên — khuyến nghị 800×600px">
            <ImageUpload
              value={fields.coverImage}
              onChange={url => set("coverImage", url)}
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