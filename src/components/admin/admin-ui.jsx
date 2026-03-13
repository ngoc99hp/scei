"use client"
// src/components/admin/admin-ui.jsx
// Shared UI primitives dùng trong tất cả admin pages
// Export: PageHeader, AdminTable, StatusBadge, EmptyAdmin,
//         ConfirmDialog, FilterBar, Pagination

import { useState } from "react"
import Link from "next/link"
import {
  Plus, Search, X, ChevronLeft, ChevronRight,
  AlertTriangle, Loader2,
} from "lucide-react"

// ─── PageHeader ───────────────────────────────────────────────
// title, description, backHref, actions (node)
export function PageHeader({ title, description, backHref, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mt-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0"
          >
            <ChevronLeft size={18} />
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

// ─── CreateButton ─────────────────────────────────────────────
export function CreateButton({ href, label = "Tạo mới" }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
    >
      <Plus size={15} />
      {label}
    </Link>
  )
}

// ─── FilterBar ────────────────────────────────────────────────
// searchValue, onSearch, filters=[{label, value, active, onClick}], extra
export function FilterBar({ searchValue, onSearch, placeholder = "Tìm kiếm...", filters = [], extra }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Search */}
      <div className="relative flex-1 min-w-50 max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          value={searchValue}
          onChange={(e) => onSearch?.(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-8 h-9 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {searchValue && (
          <button onClick={() => onSearch?.("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filter pills */}
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={f.onClick}
          className={[
            "h-9 px-3 rounded-lg text-sm border transition-colors",
            f.active
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-input hover:border-primary/50 hover:text-foreground",
          ].join(" ")}
        >
          {f.label}
          {f.count !== undefined && (
            <span className={`ml-1.5 text-xs ${f.active ? "opacity-70" : "text-muted-foreground"}`}>
              {f.count}
            </span>
          )}
        </button>
      ))}

      {extra && <div className="ml-auto flex items-center gap-2">{extra}</div>}
    </div>
  )
}

// ─── StatusBadge ─────────────────────────────────────────────
const STATUS_MAP = {
  // Event
  DRAFT:      { label: "Nháp",          cls: "bg-gray-100 text-gray-600 border-gray-200" },
  OPEN:       { label: "Mở",            cls: "bg-green-100 text-green-700 border-green-200" },
  FULL:       { label: "Hết chỗ",       cls: "bg-orange-100 text-orange-700 border-orange-200" },
  ONGOING:    { label: "Đang diễn ra",  cls: "bg-blue-100 text-blue-700 border-blue-200" },
  COMPLETED:  { label: "Kết thúc",      cls: "bg-gray-100 text-gray-500 border-gray-200" },
  CANCELLED:  { label: "Đã hủy",        cls: "bg-red-100 text-red-600 border-red-200" },
  // Program
  CLOSED:     { label: "Đã đóng",       cls: "bg-gray-100 text-gray-500 border-gray-200" },
  // Article
  PUBLISHED:  { label: "Đã đăng",       cls: "bg-green-100 text-green-700 border-green-200" },
  ARCHIVED:   { label: "Lưu trữ",       cls: "bg-gray-100 text-gray-400 border-gray-200" },
  // Application
  PENDING:    { label: "Chờ duyệt",     cls: "bg-amber-100 text-amber-700 border-amber-200" },
  REVIEWING:  { label: "Đang xét",      cls: "bg-blue-100 text-blue-700 border-blue-200" },
  APPROVED:   { label: "Chấp nhận",     cls: "bg-green-100 text-green-700 border-green-200" },
  REJECTED:   { label: "Từ chối",       cls: "bg-red-100 text-red-600 border-red-200" },
  WAITLISTED: { label: "Danh sách chờ", cls: "bg-purple-100 text-purple-700 border-purple-200" },
  // Contact
  NEW:        { label: "Mới",           cls: "bg-blue-100 text-blue-700 border-blue-200" },
  READING:    { label: "Đang đọc",      cls: "bg-purple-100 text-purple-700 border-purple-200" },
  REPLIED:    { label: "Đã trả lời",    cls: "bg-green-100 text-green-700 border-green-200" },
  // Mentor/Startup
  ACTIVE:     { label: "Hoạt động",     cls: "bg-green-100 text-green-700 border-green-200" },
  INACTIVE:   { label: "Không hoạt động",cls:"bg-gray-100 text-gray-500 border-gray-200" },
  CLOSED2:    { label: "Đóng",          cls: "bg-gray-100 text-gray-400 border-gray-200" },
  // Startup status
  INCUBATING:   { label: "Đang ươm tạo",   cls: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  ACCELERATING: { label: "Tăng tốc",        cls: "bg-blue-100 text-blue-700 border-blue-200" },
  GRADUATED:    { label: "Đã tốt nghiệp",  cls: "bg-green-100 text-green-700 border-green-200" },
}

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? { label: status, cls: "bg-gray-100 text-gray-600 border-gray-200" }
  return (
    <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border ${s.cls}`}>
      {s.label}
    </span>
  )
}

// ─── PublishBadge ─────────────────────────────────────────────
export function PublishBadge({ published }) {
  return published
    ? <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border bg-green-100 text-green-700 border-green-200">Đã publish</span>
    : <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border bg-gray-100 text-gray-500 border-gray-200">Ẩn</span>
}

// ─── EmptyAdmin ───────────────────────────────────────────────
export function EmptyAdmin({ message = "Chưa có dữ liệu", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
        <Search size={20} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── ConfirmDialog ────────────────────────────────────────────
export function ConfirmDialog({ open, title, message, confirmLabel = "Xác nhận", danger = false, onConfirm, onCancel, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-150">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${danger ? "bg-red-100" : "bg-primary/10"}`}>
          <AlertTriangle size={18} className={danger ? "text-red-600" : "text-primary"} />
        </div>
        <h3 className="font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5 ${
              danger
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {loading && <Loader2 size={13} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── TablePagination ──────────────────────────────────────────
export function TablePagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
      <span>Trang {page} / {totalPages}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let p = i + 1
          if (totalPages > 7) {
            if (page <= 4) p = i + 1
            else if (page >= totalPages - 3) p = totalPages - 6 + i
            else p = page - 3 + i
          }
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`h-8 w-8 rounded-lg border text-xs transition-colors ${
                p === page
                  ? "bg-primary text-primary-foreground border-primary font-semibold"
                  : "border-border hover:bg-accent"
              }`}
            >
              {p}
            </button>
          )
        })}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 rounded-lg border border-border flex items-center justify-center hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── FormSection ──────────────────────────────────────────────
export function FormSection({ title, description, children }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Field helpers ────────────────────────────────────────────
export const inputCls = "w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
export const labelCls = "block text-xs font-medium text-muted-foreground mb-1"

export function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className={labelCls}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  )
}

// ─── SaveBar ──────────────────────────────────────────────────
export function SaveBar({ saving, success, error, onSave, extra }) {
  return (
    <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur border-t border-border px-5 py-3 flex items-center justify-between gap-4">
      <div className="text-sm">
        {error   && <span className="text-red-600">{error}</span>}
        {success && <span className="text-green-600 flex items-center gap-1">✅ Đã lưu thành công</span>}
      </div>
      <div className="flex items-center gap-2">
        {extra}
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving && <Loader2 size={13} className="animate-spin" />}
          {saving ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </div>
  )
}