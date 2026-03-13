"use client"
// src/app/(admin)/admin/articles/[id]/edit/page.js
// Dùng chung cho tạo mới (id="new") và edit (id=uuid)

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import dynamic from "next/dynamic"
import {
  PageHeader, FormSection, Field, inputCls, SaveBar,
} from "@/components/admin/admin-ui"
import { ImageUpload } from "@/components/admin/image-upload"

// Lazy-load editor để tránh SSR
const RichTextEditor = dynamic(
  () => import("@/components/admin/rich-text-editor"),
  { ssr: false, loading: () => <div className="h-64 rounded-xl bg-muted animate-pulse" /> }
)

const STATUS_OPTIONS = [
  { value: "DRAFT",     label: "Nháp" },
  { value: "PUBLISHED", label: "Đã đăng" },
  { value: "ARCHIVED",  label: "Lưu trữ" },
]

const CATEGORY_OPTIONS = [
  "Khởi nghiệp", "Công nghệ", "Đầu tư", "Sự kiện", "Mentor", "Tin tức", "Khác"
]

const INIT = {
  title: "", slug: "", excerpt: "", content: "", cover_image: "",
  status: "DRAFT", category: "", tags: "",
  meta_title: "", meta_desc: "",
}

function slugify(str) {
  return str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").replace(/-+/g, "-")
}

export default function ArticleEditPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const isNew    = id === "new"

  const [loading, setLoading]   = useState(!isNew)
  const [saving,  setSaving]    = useState(false)
  const [error,   setError]     = useState("")
  const [success, setSuccess]   = useState(false)
  const [fields,  setFields]    = useState(INIT)
  const [autoSlug, setAutoSlug] = useState(isNew)

  // Load bài viết nếu edit
  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/articles/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.article) {
          const a = data.article
          setFields({
            title:       a.title       ?? "",
            slug:        a.slug        ?? "",
            excerpt:     a.excerpt     ?? "",
            content:     a.content     ?? "",
            cover_image: a.cover_image ?? "",
            status:      a.status      ?? "DRAFT",
            category:    a.category    ?? "",
            tags:        (a.tags ?? []).join(", "),
            meta_title:  a.meta_title  ?? "",
            meta_desc:   a.meta_desc   ?? "",
          })
          setAutoSlug(false)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, isNew])

  function set(name, value) {
    setFields(prev => {
      const next = { ...prev, [name]: value }
      // Auto-generate slug từ title khi tạo mới
      if (name === "title" && autoSlug) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  function handleChange(e) {
    const { name, value } = e.target
    set(name, value)
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    setSuccess(false)

    const body = {
      ...fields,
      tags: fields.tags.split(",").map(t => t.trim()).filter(Boolean),
    }

    const url    = isNew ? "/api/admin/articles"      : `/api/admin/articles/${id}`
    const method = isNew ? "POST"                      : "PATCH"

    try {
      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Lưu thất bại")
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        if (isNew && data.article?.id) {
          router.replace(`/admin/articles/${data.article.id}/edit`)
        }
      }
    } catch {
      setError("Lỗi kết nối")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="p-5 max-w-4xl mx-auto space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="p-5">
        <PageHeader
          title={isNew ? "Viết bài mới" : "Chỉnh sửa bài viết"}
          description={fields.slug ? `/${fields.slug}` : ""}
          backHref="/admin/articles"
          actions={
            !isNew && fields.status === "PUBLISHED" && fields.slug ? (
              <Link href={`/news/${fields.slug}`} target="_blank"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <ExternalLink size={14} /> Xem trang
              </Link>
            ) : null
          }
        />

        <div className="space-y-4">
          {/* Thông tin cơ bản */}
          <FormSection title="Thông tin bài viết">
            <Field label="Tiêu đề" required>
              <input name="title" value={fields.title} onChange={handleChange} className={inputCls} placeholder="Tiêu đề bài viết..." />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug (URL)" hint="Tự động tạo từ tiêu đề khi tạo mới">
                <input
                  name="slug"
                  value={fields.slug}
                  onChange={(e) => { setAutoSlug(false); set("slug", e.target.value) }}
                  className={inputCls}
                  placeholder="tieu-de-bai-viet"
                />
              </Field>
              <Field label="Danh mục">
                <select name="category" value={fields.category} onChange={handleChange} className={inputCls}>
                  <option value="">— Chọn danh mục —</option>
                  {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Trạng thái">
                <select name="status" value={fields.status} onChange={handleChange} className={inputCls}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Tags" hint="Phân cách bằng dấu phẩy">
                <input name="tags" value={fields.tags} onChange={handleChange} className={inputCls} placeholder="khởi nghiệp, công nghệ, AI" />
              </Field>
            </div>
          </FormSection>

          {/* Ảnh bìa */}
          <FormSection title="Ảnh bìa" description="Khuyến nghị 1200×630px">
            <ImageUpload
              value={fields.cover_image}
              onChange={(url) => set("cover_image", url)}
              folder="article"
            />
          </FormSection>

          {/* Mô tả ngắn */}
          <FormSection title="Mô tả ngắn" description="Hiển thị trong card preview và meta description (tối đa 300 ký tự)">
            <textarea
              name="excerpt"
              value={fields.excerpt}
              onChange={handleChange}
              rows={3}
              maxLength={300}
              className={`${inputCls} resize-none`}
              placeholder="Tóm tắt ngắn gọn về bài viết..."
            />
            <p className="text-xs text-muted-foreground text-right">{fields.excerpt.length}/300</p>
          </FormSection>

          {/* Nội dung */}
          <FormSection title="Nội dung" description="Soạn thảo nội dung đầy đủ của bài viết">
            <RichTextEditor
              value={fields.content}
              onChange={(html) => set("content", html)}
              placeholder="Bắt đầu viết nội dung bài viết..."
              minHeight={400}
            />
          </FormSection>

          {/* SEO */}
          <FormSection title="SEO" description="Tùy chỉnh hiển thị trên Google Search (để trống sẽ dùng tiêu đề & mô tả ngắn)">
            <Field label="Meta title">
              <input name="meta_title" value={fields.meta_title} onChange={handleChange} className={inputCls} placeholder={fields.title} maxLength={70} />
              <p className="text-xs text-muted-foreground mt-1">{fields.meta_title.length}/70 ký tự</p>
            </Field>
            <Field label="Meta description">
              <textarea name="meta_desc" value={fields.meta_desc} onChange={handleChange} rows={2} maxLength={160} className={`${inputCls} resize-none`} placeholder={fields.excerpt || "Mô tả xuất hiện trên Google..."} />
              <p className="text-xs text-muted-foreground mt-1">{fields.meta_desc.length}/160 ký tự</p>
            </Field>
          </FormSection>
        </div>
      </div>

      <SaveBar
        saving={saving}
        success={success}
        error={error}
        onSave={handleSave}
      />
    </div>
  )
}