"use client"
// src/app/(admin)/admin/events/page.js

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Pencil, Trash2, ExternalLink, Users } from "lucide-react"
import {
  PageHeader, CreateButton, FilterBar,
  StatusBadge, PublishBadge, EmptyAdmin,
  ConfirmDialog, TablePagination,
} from "@/components/admin/admin-ui"

const STATUS_FILTERS = [
  { label: "Tất cả",        value: "" },
  { label: "Mở",            value: "OPEN" },
  { label: "Đang diễn ra",  value: "ONGOING" },
  { label: "Nháp",          value: "DRAFT" },
  { label: "Kết thúc",      value: "COMPLETED" },
  { label: "Đã hủy",        value: "CANCELLED" },
]

const EVENT_TYPE_VI = {
  WORKSHOP: "Workshop", PITCHING: "Pitching", NETWORKING: "Networking",
  SEMINAR: "Seminar", CONFERENCE: "Conference", OTHER: "Khác",
}

function fmtDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default function EventsPage() {
  const [events,       setEvents]       = useState([])
  const [total,        setTotal]        = useState(0)
  const [totalPages,   setTotalPages]   = useState(1)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, q: search, status: statusFilter })
      const res  = await fetch(`/api/admin/events?${p}`)
      const data = await res.json()
      setEvents(data.events ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
    } finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { fetchEvents() }, [fetchEvents])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/admin/events/${deleteTarget.id}`, { method: "DELETE" })
    setDeleting(false)
    setDeleteTarget(null)
    fetchEvents()
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <PageHeader
        title="Sự kiện"
        description={`${total} sự kiện`}
        actions={<CreateButton href="/admin/events/new" label="Tạo sự kiện" />}
      />

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên sự kiện..."
        filters={STATUS_FILTERS.map((f) => ({
          ...f, active: f.value === statusFilter, onClick: () => setStatusFilter(f.value),
        }))}
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-2/5" />
                <div className="h-4 bg-muted rounded w-16 ml-auto" />
                <div className="h-4 bg-muted rounded w-20" />
                <div className="h-4 bg-muted rounded w-8" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyAdmin message="Chưa có sự kiện nào" action={<CreateButton href="/admin/events/new" label="Tạo sự kiện đầu tiên" />} />
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_100px_110px_110px_100px_80px] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Tên sự kiện</span>
              <span>Loại</span>
              <span>Trạng thái</span>
              <span>Ngày bắt đầu</span>
              <span>Đăng ký</span>
              <span className="text-right">Hành động</span>
            </div>

            <ul className="divide-y divide-border">
              {events.map((e) => (
                <li key={e.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_110px_110px_100px_80px] gap-2 md:gap-4 px-4 py-3 hover:bg-accent/40 transition-colors items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                      {e.is_featured && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded-full border border-amber-200 shrink-0">⭐ Nổi bật</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">/{e.slug}</p>
                      <PublishBadge published={e.is_published} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{EVENT_TYPE_VI[e.type] ?? e.type}</span>
                  <StatusBadge status={e.status} />
                  <span className="text-xs text-muted-foreground">{fmtDate(e.start_date)}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users size={11} />
                    {e.registered_count ?? 0}{e.max_attendees ? `/${e.max_attendees}` : ""}
                  </span>
                  <div className="flex items-center justify-end gap-1">
                    {e.is_published && (
                      <Link href={`/events/${e.slug}`} target="_blank"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Xem trang">
                        <ExternalLink size={14} />
                      </Link>
                    )}
                    <Link href={`/admin/events/${e.id}/edit`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Chỉnh sửa">
                      <Pencil size={14} />
                    </Link>
                    <button onClick={() => setDeleteTarget({ id: e.id, title: e.title })}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors" title="Xóa">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <TablePagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa sự kiện?"
        message={`"${deleteTarget?.title}" sẽ bị xóa vĩnh viễn, bao gồm toàn bộ lịch sử đăng ký.`}
        confirmLabel="Xóa" danger loading={deleting}
        onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}