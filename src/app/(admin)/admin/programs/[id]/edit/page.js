"use client"
// src/app/(admin)/admin/programs/[id]/edit/page.js
// Form chỉnh sửa chương trình — có Tiptap editor cho cột content
// Route: /admin/programs/[id]/edit

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import RichTextEditor from "@/components/admin/rich-text-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"

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

export default function ProgramEditPage() {
  const { id } = useParams()

  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState("")
  const [success,  setSuccess]  = useState(false)
  const [fields,   setFields]   = useState({
    name: "", slug: "", type: "INCUBATION", status: "DRAFT",
    short_desc: "", description: "", content: "",
    max_applicants: "", is_published: false, is_featured: false,
  })

  useEffect(() => {
    fetch(`/api/admin/programs/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.program) {
          setFields({
            name:           data.program.name           ?? "",
            slug:           data.program.slug           ?? "",
            type:           data.program.type           ?? "INCUBATION",
            status:         data.program.status         ?? "DRAFT",
            short_desc:     data.program.short_desc     ?? "",
            description:    data.program.description    ?? "",
            content:        data.program.content        ?? "",
            max_applicants: data.program.max_applicants?.toString() ?? "",
            is_published:   data.program.is_published   ?? false,
            is_featured:    data.program.is_featured    ?? false,
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
      const res = await fetch(`/api/admin/programs/${id}`, {
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/programs" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Chỉnh sửa chương trình</h1>
            <p className="text-sm text-gray-500">{fields.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {fields.slug && fields.is_published && (
            <Link href={`/programs/${fields.slug}`} target="_blank">
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
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Thông tin cơ bản</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Tên chương trình <span className="text-red-500">*</span></label>
              <input name="name" value={fields.name} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug (URL)</label>
              <input name="slug" value={fields.slug} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Loại chương trình</label>
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
              <label className={labelClass}>Số đơn tối đa</label>
              <input name="max_applicants" type="number" value={fields.max_applicants} onChange={handleChange} className={inputClass} placeholder="Để trống = không giới hạn" />
            </div>
            <div className="flex items-center gap-4 col-span-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="is_published" checked={fields.is_published} onChange={handleChange} className="rounded" />
                Đã publish
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="is_featured" checked={fields.is_featured} onChange={handleChange} className="rounded" />
                Nổi bật (hiển thị trang chủ)
              </label>
            </div>
          </div>
        </div>

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

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div>
            <h2 className="font-semibold text-gray-900">Nội dung chi tiết</h2>
            <p className="text-xs text-gray-500 mt-0.5">Hiển thị trên trang chi tiết chương trình — hỗ trợ định dạng phong phú</p>
          </div>
          <RichTextEditor
            value={fields.content}
            onChange={(html) => setFields(prev => ({ ...prev, content: html }))}
            placeholder="Giới thiệu chương trình, quy trình, quyền lợi..."
          />
        </div>
      </div>
    </div>
  )
}