"use client"
// src/app/(admin)/admin/startups/page.js

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Pencil, Trash2, ExternalLink } from "lucide-react"
import {
  PageHeader, CreateButton, FilterBar, StatusBadge, PublishBadge,
  EmptyAdmin, ConfirmDialog, TablePagination,
} from "@/components/admin/admin-ui"

const STATUS_FILTERS = [
  { label: "Tất cả",        value: "" },
  { label: "Đang ươm tạo",  value: "INCUBATING" },
  { label: "Tăng tốc",      value: "ACCELERATING" },
  { label: "Tốt nghiệp",    value: "GRADUATED" },
  { label: "Không HĐ",      value: "INACTIVE" },
]

export default function StartupsPage() {
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
      const res  = await fetch(`/api/admin/startups?${p}`)
      const data = await res.json()
      setItems(data.startups ?? []); setTotal(data.total ?? 0); setTotalPages(data.totalPages ?? 1)
    } finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/admin/startups/${deleteTarget.id}`, { method: "DELETE" })
    setDeleting(false); setDeleteTarget(null); fetchData()
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <PageHeader title="Startup" description={`${total} startup`}
        actions={<CreateButton href="/admin/startups/new" label="Thêm startup" />} />
      <FilterBar searchValue={search} onSearch={setSearch} placeholder="Tìm theo tên startup..."
        filters={STATUS_FILTERS.map(f => ({ ...f, active: f.value === statusFilter, onClick: () => setStatusFilter(f.value) }))} />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y">{Array.from({length:6}).map((_,i) => <div key={i} className="px-4 py-3 flex gap-4 animate-pulse"><div className="w-8 h-8 rounded bg-muted" /><div className="h-4 bg-muted rounded w-1/3 ml-2" /><div className="h-4 bg-muted rounded w-20 ml-auto" /></div>)}</div>
        ) : items.length === 0 ? (
          <EmptyAdmin message="Chưa có startup nào" action={<CreateButton href="/admin/startups/new" />} />
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_120px_120px_80px] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Startup</span><span>Ngành</span><span>Trạng thái</span><span className="text-right">Hành động</span>
            </div>
            <ul className="divide-y divide-border">
              {items.map(s => (
                <li key={s.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_80px] gap-2 md:gap-4 px-4 py-3 hover:bg-accent/40 items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    {s.logo ? (
                      <img src={s.logo} alt={s.name} className="w-9 h-9 rounded-lg object-cover border border-border shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                        {s.name[0]}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                        {s.is_featured && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded-full border border-amber-200 shrink-0">⭐</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{s.stage}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <PublishBadge published={s.is_published} />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{s.industry || "—"}</span>
                  <StatusBadge status={s.status} />
                  <div className="flex items-center justify-end gap-1">
                    {s.is_published && <Link href={`/startups/${s.slug}`} target="_blank" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><ExternalLink size={14} /></Link>}
                    <Link href={`/admin/startups/${s.id}/edit`} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Pencil size={14} /></Link>
                    <button onClick={() => setDeleteTarget({ id: s.id, title: s.name })} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
            <TablePagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </div>
      <ConfirmDialog open={!!deleteTarget} title="Xóa startup?" message={`"${deleteTarget?.title}" sẽ bị xóa vĩnh viễn.`} confirmLabel="Xóa" danger loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}