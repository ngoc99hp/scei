// src/components/admin/image-upload.jsx
// Component upload ảnh dùng lại trong tất cả admin forms
// Features: drag & drop, preview, progress, error handling

"use client"

import { useState, useRef, useCallback } from "react"
import Image from "next/image"
import { Upload, X, ImageIcon, Loader2, AlertCircle } from "lucide-react"

/**
 * @param {object} props
 * @param {string} props.name - field name
 * @param {string} [props.value] - URL ảnh hiện tại
 * @param {function} props.onChange - callback(url: string)
 * @param {"mentor"|"startup"|"program"|"event"|"article"|"resource"|"misc"} props.type
 * @param {string} [props.slug] - slug để đặt tên file
 * @param {string} [props.label]
 * @param {string} [props.hint] - gợi ý kích thước
 * @param {"square"|"landscape"|"portrait"} [props.aspect]
 */
export function ImageUpload({
  name,
  value,
  onChange,
  type = "misc",
  slug = "",
  label = "Hình ảnh",
  hint,
  aspect = "landscape",
}) {
  const [preview, setPreview] = useState(value || "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef(null)

  // Tỉ lệ khung hình theo aspect
  const aspectRatio = {
    square:    "aspect-square",
    landscape: "aspect-video",
    portrait:  "aspect-[3/4]",
  }[aspect]

  // Gợi ý kích thước mặc định theo type
  const defaultHint = {
    mentor:   "Ảnh vuông, tối thiểu 400x400px",
    startup:  "Ảnh 4:3, tối thiểu 800x600px",
    program:  "Ảnh 16:9, tối thiểu 1200x675px",
    event:    "Ảnh 16:9, tối thiểu 1200x675px",
    article:  "Ảnh 16:9, tối thiểu 1200x630px",
    resource: "Ảnh thumbnail, tối thiểu 800x600px",
    misc:     "Tối đa 5MB, định dạng JPG/PNG/WebP",
  }[type]

  const displayHint = hint || defaultHint

  async function handleFile(file) {
    if (!file) return

    // Validate phía client
    const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!ALLOWED.includes(file.type)) {
      setError("Chỉ chấp nhận JPG, PNG, WebP, GIF")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File quá lớn. Tối đa 5MB.")
      return
    }

    setError("")
    setUploading(true)

    // Preview ngay lập tức (client-side)
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      formData.append("slug", slug)

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Upload thất bại")
      }

      // Cập nhật preview với URL Cloudinary thật
      setPreview(data.url)
      onChange?.(data.url)
    } catch (err) {
      setError(err.message)
      // Revert về ảnh cũ nếu upload thất bại
      setPreview(value || "")
      onChange?.(value || "")
    } finally {
      setUploading(false)
      URL.revokeObjectURL(localUrl)
    }
  }

  function handleInputChange(e) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [slug, type, value]) // eslint-disable-line

  function handleRemove(e) {
    e.stopPropagation()
    setPreview("")
    onChange?.("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>

      {/* Hidden input (để form có thể đọc giá trị) */}
      <input type="hidden" name={name} value={preview} />

      {/* Upload zone */}
      <div
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : preview
              ? "border-border bg-muted/20"
              : "border-border bg-muted/10 hover:border-primary/50 hover:bg-primary/5"
          }
          ${aspectRatio}
          overflow-hidden
        `}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Preview ảnh */}
        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
            />

            {/* Overlay khi hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => !uploading && inputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                Thay ảnh
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Xóa
              </button>
            </div>
          </>
        ) : (
          /* Placeholder khi chưa có ảnh */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
            <div className={`
              rounded-full p-3 transition-colors
              ${isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
            `}>
              <ImageIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Thả file vào đây" : "Kéo thả hoặc click để chọn ảnh"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {displayHint}
              </p>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">Đang tải lên...</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
        disabled={uploading}
      />
    </div>
  )
}