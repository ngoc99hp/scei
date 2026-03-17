"use client"
// src/app/(admin)/admin/resources/page.js

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Pencil, Trash2, ExternalLink, Download } from "lucide-react"
import {
  PageHeader, CreateButton, FilterBar, PublishBadge,
  EmptyAdmin, ConfirmDialog, TablePagination,
} from "@/components/admin/admin-ui"

const TYPE_FILTERS = [
  { label: "Tất cả",     value: "" },
  { label: "Tài liệu",   value: "DOCUMENT" },
  { label: "Video",      value: "VIDEO" },
  { label: "Template",   value: "TEMPLATE" },
  { label: "Hướng dẫn",  value: "GUIDE" },
  { label: "Tool",       value: "TOOL" },
]
const TYPE_VI = { DOCUMENT: "Tài liệu", VIDEO: "Video", TEMPLATE: "Template", GUIDE: "Hướng dẫn", TOOL: "Tool", OTHER: "Khác" }

export default function ResourcesPage() {
  const [items,       setItems]       = useState([])
  const [total,       setTotal]       = useState(0)
  const [totalPages,  setTotalPages]  = useState(1)
  const [page,        setPage]        = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState("")
  const [typeFilter,  setTypeFilter]  = useState("")
  const [deleteTarget,setDeleteTarget]= useState(null)
  const [deleting,    setDeleting]    = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, q: search, type: typeFilter })
      const res  = await fetch(`/api/admin/resources?${p}`)
      const data = await res.json()
      setItems(data.resources ?? []); setTotal(data.total ?? 0); setTotalPages(data.totalPages ?? 1)
    } finally { setLoading(false) }
  }, [page, search, typeFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search, typeFilter])

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/admin/resources/${deleteTarget.id}`, { method: "DELETE" })
    setDeleting(false); setDeleteTarget(null); fetchData()
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <PageHeader title="Tài nguyên" description={`${total} tài nguyên`}
        actions={<CreateButton href="/admin/resources/new" label="Thêm tài nguyên" />} />
      <FilterBar searchValue={search} onSearch={setSearch} placeholder="Tìm theo tiêu đề..."
        filters={TYPE_FILTERS.map(f => ({ ...f, active: f.value === typeFilter, onClick: () => setTypeFilter(f.value) }))} />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y">{Array.from({length:6}).map((_,i) => <div key={i} className="px-4 py-3 flex gap-4 animate-pulse"><div className="h-4 bg-muted rounded w-2/5" /><div className="h-4 bg-muted rounded w-20 ml-auto" /></div>)}</div>
        ) : items.length === 0 ? (
          <EmptyAdmin message="Chưa có tài nguyên nào" action={<CreateButton href="/admin/resources/new" />} />
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_100px_120px_80px_80px] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Tiêu đề</span><span>Loại</span><span>Danh mục</span><span>Tải xuống</span><span className="text-right">Hành động</span>
            </div>
            <ul className="divide-y divide-border">
              {items.map(r => (
                <li key={r.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px_80px_80px] gap-2 md:gap-4 px-4 py-3 hover:bg-accent/40 items-center">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                      {r.is_featured && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 rounded-full border border-amber-200 shrink-0">⭐</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground truncate">/{r.slug}</span>
                      <PublishBadge published={r.is_published} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{TYPE_VI[r.type] ?? r.type}</span>
                  <span className="text-xs text-muted-foreground">{r.category || "—"}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Download size={11} />{r.download_count ?? 0}</span>
                  <div className="flex items-center justify-end gap-1">
                    {r.is_published && (
                      <Link href={`/resources/${r.slug}`} target="_blank" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><ExternalLink size={14} /></Link>
                    )}
                    <Link href={`/admin/resources/${r.id}/edit`} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Pencil size={14} /></Link>
                    <button onClick={() => setDeleteTarget({ id: r.id, title: r.title })} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </li>
              ))}
            </ul>
            <TablePagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </div>
      <ConfirmDialog open={!!deleteTarget} title="Xóa tài nguyên?" message={`"${deleteTarget?.title}" sẽ bị xóa vĩnh viễn.`} confirmLabel="Xóa" danger loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}