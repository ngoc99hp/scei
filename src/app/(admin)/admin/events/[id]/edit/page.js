"use client"
// src/app/(admin)/admin/events/[id]/edit/page.js
// Form chỉnh sửa event — có Tiptap editor cho cột content
// Route: /admin/events/[id]/edit

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import RichTextEditor from "@/components/admin/rich-text-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"

const STATUS_OPTIONS = [
  { value: "DRAFT",     label: "Nháp" },
  { value: "OPEN",      label: "Mở đăng ký" },
  { value: "FULL",      label: "Hết chỗ" },
  { value: "ONGOING",   label: "Đang diễn ra" },
  { value: "COMPLETED", label: "Đã kết thúc" },
  { value: "CANCELLED", label: "Đã hủy" },
]

const TYPE_OPTIONS = [
  { value: "WORKSHOP",    label: "Workshop" },
  { value: "PITCHING",    label: "Pitching" },
  { value: "NETWORKING",  label: "Networking" },
  { value: "SEMINAR",     label: "Seminar" },
  { value: "CONFERENCE",  label: "Conference" },
  { value: "OTHER",       label: "Khác" },
]

export default function EventEditPage() {
  const router = useRouter()
  const { id }  = useParams()

  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState("")
  const [success,  setSuccess]  = useState(false)
  const [fields,   setFields]   = useState({
    title: "", slug: "", type: "WORKSHOP", status: "DRAFT",
    short_desc: "", description: "", content: "",
    location: "", is_online: false, max_attendees: "",
    is_published: false, is_featured: false,
  })

  // Load event data
  useEffect(() => {
    fetch(`/api/admin/events/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.event) {
          setFields({
            title:        data.event.title        ?? "",
            slug:         data.event.slug         ?? "",
            type:         data.event.type         ?? "WORKSHOP",
            status:       data.event.status       ?? "DRAFT",
            short_desc:   data.event.short_desc   ?? "",
            description:  data.event.description  ?? "",
            content:      data.event.content      ?? "",
            location:     data.event.location     ?? "",
            is_online:    data.event.is_online     ?? false,
            max_attendees: data.event.max_attendees?.toString() ?? "",
            is_published: data.event.is_published  ?? false,
            is_featured:  data.event.is_featured   ?? false,
          })
        }
        setLoading(false)
      })
      .catch(() => { setError("Không thể tải dữ liệu."); setLoading(false) })
  }, [id])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFields(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  async function handleSave() {
    setSaving(true)
    setError("")
    setSuccess(false)
    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(fields),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Lưu thất bại.")
      else { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
    } catch { setError("Lỗi kết nối.") }
    finally  { setSaving(false) }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  if (loading) return <div className="p-8 text-gray-500">Đang tải...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/events" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chỉnh sửa sự kiện</h1>
            <p className="text-sm text-gray-500">{fields.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {fields.slug && fields.is_published && (
            <Link href={`/events/${fields.slug}`} target="_blank">
              <Button variant="outline" size="sm"><Eye size={14} className="mr-1.5" />Xem trang</Button>
            </Link>
          )}
          <Button onClick={handleSave} disabled={saving} className="rounded-full">
            <Save size={14} className="mr-1.5" />{saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </div>
      </div>

      {error   && <div className="mb-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm">✅ Đã lưu thành công!</div>}

      <div className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Thông tin cơ bản</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Tiêu đề <span className="text-red-500">*</span></label>
              <input name="title" value={fields.title} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug (URL)</label>
              <input name="slug" value={fields.slug} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Loại sự kiện</label>
              <select name="type" value={fields.type} onChange={handleChange} className={inputClass}>
                {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Trạng thái</label>
              <select name="status" value={fields.status} onChange={handleChange} className={inputClass}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Số lượng tối đa</label>
              <input name="max_attendees" type="number" value={fields.max_attendees} onChange={handleChange} className={inputClass} placeholder="Để trống = không giới hạn" />
            </div>
            <div>
              <label className={labelClass}>Địa điểm</label>
              <input name="location" value={fields.location} onChange={handleChange} className={inputClass} placeholder="GEM Center, TP.HCM" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="is_online" checked={fields.is_online} onChange={handleChange} className="rounded" />
                Sự kiện online
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="is_published" checked={fields.is_published} onChange={handleChange} className="rounded" />
                Đã publish
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="is_featured" checked={fields.is_featured} onChange={handleChange} className="rounded" />
                Nổi bật
              </label>
            </div>
          </div>
        </div>

        {/* Mô tả ngắn */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div>
            <h2 className="font-semibold text-gray-900">Mô tả ngắn</h2>
            <p className="text-xs text-gray-500 mt-0.5">Dùng cho card preview và SEO meta (plain text, tối đa 300 ký tự)</p>
          </div>
          <textarea
            name="short_desc"
            value={fields.short_desc}
            onChange={handleChange}
            rows={2}
            maxLength={300}
            className={`${inputClass} resize-none`}
          />
          <p className="text-xs text-gray-400 text-right">{fields.short_desc.length}/300</p>
        </div>

        {/* Nội dung chi tiết (Tiptap) */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div>
            <h2 className="font-semibold text-gray-900">Nội dung chi tiết</h2>
            <p className="text-xs text-gray-500 mt-0.5">Hiển thị trên trang chi tiết sự kiện — hỗ trợ định dạng phong phú</p>
          </div>
          <RichTextEditor
            value={fields.content}
            onChange={(html) => setFields(prev => ({ ...prev, content: html }))}
            placeholder="Mô tả chi tiết về sự kiện, chương trình, diễn giả..."
          />
        </div>
      </div>
    </div>
  )
}