"use client"
// src/app/(admin)/admin/mentors/page.js

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Pencil, Trash2, ExternalLink, GripVertical } from "lucide-react"
import {
  PageHeader, CreateButton, FilterBar, StatusBadge, PublishBadge,
  EmptyAdmin, ConfirmDialog, TablePagination,
} from "@/components/admin/admin-ui"

const STATUS_FILTERS = [
  { label: "Tất cả",          value: "" },
  { label: "Hoạt động",       value: "ACTIVE" },
  { label: "Không hoạt động", value: "INACTIVE" },
]

export default function MentorsPage() {
  const [items,        setItems]        = useState([])
  const [total,        setTotal]        = useState(0)
  const [totalPages,   setTotalPages]   = useState(1)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, q: search, status: statusFilter })
      const res  = await fetch(`/api/admin/mentors?${p}`)
      const data = await res.json()
      setItems(data.mentors ?? []); setTotal(data.total ?? 0); setTotalPages(data.totalPages ?? 1)
    } finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/admin/mentors/${deleteTarget.id}`, { method: "DELETE" })
    setDeleting(false); setDeleteTarget(null); fetchData()
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <PageHeader title="Mentor" description={`${total} mentor`}
        actions={<CreateButton href="/admin/mentors/new" label="Thêm mentor" />} />
      <FilterBar searchValue={search} onSearch={setSearch} placeholder="Tìm theo tên mentor..."
        filters={STATUS_FILTERS.map(f => ({ ...f, active: f.value === statusFilter, onClick: () => setStatusFilter(f.value) }))} />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y">{Array.from({length:6}).map((_,i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5"><div className="h-4 bg-muted rounded w-1/3" /><div className="h-3 bg-muted rounded w-1/4" /></div>
              <div className="h-4 bg-muted rounded w-16 ml-auto" />
            </div>
          ))}</div>
        ) : items.length === 0 ? (
          <EmptyAdmin message="Chưa có mentor nào" action={<CreateButton href="/admin/mentors/new" />} />
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_160px_120px_80px] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Mentor</span><span>Tổ chức</span><span>Trạng thái</span><span className="text-right">Hành động</span>
            </div>
            <ul className="divide-y divide-border">
              {items.map(m => (
                <li key={m.id} className="grid grid-cols-1 md:grid-cols-[1fr_160px_120px_80px] gap-2 md:gap-4 px-4 py-3 hover:bg-accent/40 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    {m.avatar ? (
                      <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                        {m.name[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                        {m.is_featured && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded-full border border-amber-200 shrink-0">⭐</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground truncate">{m.title || "—"}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <PublishBadge published={m.is_published} />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{m.organization || "—"}</span>
                  <StatusBadge status={m.status} />
                  <div className="flex items-center justify-end gap-1">
                    {m.is_published && <Link href={`/mentors/${m.slug}`} target="_blank" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><ExternalLink size={14} /></Link>}
                    <Link href={`/admin/mentors/${m.id}/edit`} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Pencil size={14} /></Link>
                    <button onClick={() => setDeleteTarget({ id: m.id, title: m.name })} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
            <TablePagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </div>
      <ConfirmDialog open={!!deleteTarget} title="Xóa mentor?" message={`"${deleteTarget?.title}" sẽ bị xóa vĩnh viễn.`} confirmLabel="Xóa" danger loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}