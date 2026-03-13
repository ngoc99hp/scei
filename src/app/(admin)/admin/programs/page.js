"use client"
// src/app/(admin)/admin/programs/page.js

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Pencil, Trash2, ExternalLink, Calendar } from "lucide-react"
import {
  PageHeader, CreateButton, FilterBar,
  StatusBadge, PublishBadge, EmptyAdmin, ConfirmDialog, TablePagination,
} from "@/components/admin/admin-ui"

const STATUS_FILTERS = [
  { label: "Tất cả",    value: "" },
  { label: "Đang mở",   value: "OPEN" },
  { label: "Nháp",      value: "DRAFT" },
  { label: "Đã đóng",   value: "CLOSED" },
  { label: "Kết thúc",  value: "COMPLETED" },
]
const TYPE_VI = { INCUBATION: "Ươm tạo", ACCELERATION: "Tăng tốc", COWORKING: "Coworking" }

function fmtDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default function ProgramsPage() {
  const [items,        setItems]        = useState([])
  const [total,        setTotal]        = useState(0)
  const [totalPages,   setTotalPages]   = useState(1)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  const fetch_ = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, q: search, status: statusFilter })
      const res  = await fetch(`/api/admin/programs?${p}`)
      const data = await res.json()
      setItems(data.programs ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
    } finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { fetch_() }, [fetch_])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/admin/programs/${deleteTarget.id}`, { method: "DELETE" })
    setDeleting(false); setDeleteTarget(null); fetch_()
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <PageHeader title="Chương trình" description={`${total} chương trình`}
        actions={<CreateButton href="/admin/programs/new" label="Tạo chương trình" />} />
      <FilterBar searchValue={search} onSearch={setSearch} placeholder="Tìm theo tên chương trình..."
        filters={STATUS_FILTERS.map(f => ({ ...f, active: f.value === statusFilter, onClick: () => setStatusFilter(f.value) }))} />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border">{Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-2/5" /><div className="h-4 bg-muted rounded w-20 ml-auto" />
            </div>
          ))}</div>
        ) : items.length === 0 ? (
          <EmptyAdmin message="Chưa có chương trình nào" action={<CreateButton href="/admin/programs/new" />} />
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_100px_110px_120px_80px] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Tên chương trình</span><span>Loại</span><span>Trạng thái</span><span>Hạn nộp đơn</span><span className="text-right">Hành động</span>
            </div>
            <ul className="divide-y divide-border">
              {items.map(p => (
                <li key={p.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_110px_120px_80px] gap-2 md:gap-4 px-4 py-3 hover:bg-accent/40 items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                      {p.is_featured && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded-full border border-amber-200 shrink-0">⭐</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">/{p.slug}</span>
                      <PublishBadge published={p.is_published} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{TYPE_VI[p.type] ?? p.type}</span>
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar size={11} />{fmtDate(p.apply_deadline)}</span>
                  <div className="flex items-center justify-end gap-1">
                    {p.is_published && <Link href={`/programs/${p.slug}`} target="_blank" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><ExternalLink size={14} /></Link>}
                    <Link href={`/admin/programs/${p.id}/edit`} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Pencil size={14} /></Link>
                    <button onClick={() => setDeleteTarget({ id: p.id, title: p.name })} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
            <TablePagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </div>
      <ConfirmDialog open={!!deleteTarget} title="Xóa chương trình?" message={`"${deleteTarget?.title}" sẽ bị xóa vĩnh viễn.`} confirmLabel="Xóa" danger loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}