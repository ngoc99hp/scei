"use client"
// src/app/(admin)/admin/articles/page.js

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, ExternalLink } from "lucide-react"
import {
  PageHeader, CreateButton, FilterBar,
  StatusBadge, EmptyAdmin, ConfirmDialog, TablePagination,
} from "@/components/admin/admin-ui"

const STATUS_FILTERS = [
  { label: "Tất cả",   value: "" },
  { label: "Đã đăng",  value: "PUBLISHED" },
  { label: "Nháp",     value: "DRAFT" },
  { label: "Lưu trữ",  value: "ARCHIVED" },
]

function fmtDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export default function ArticlesPage() {
  const [articles,    setArticles]    = useState([])
  const [total,       setTotal]       = useState(0)
  const [totalPages,  setTotalPages]  = useState(1)
  const [page,        setPage]        = useState(1)
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState("")
  const [statusFilter,setStatusFilter]= useState("")
  const [deleteTarget,setDeleteTarget]= useState(null)  // { id, title }
  const [deleting,    setDeleting]    = useState(false)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, q: search, status: statusFilter })
      const res  = await fetch(`/api/admin/articles?${p}`)
      const data = await res.json()
      setArticles(data.articles ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  // Reset page khi filter đổi
  useEffect(() => { setPage(1) }, [search, statusFilter])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await fetch(`/api/admin/articles/${deleteTarget.id}`, { method: "DELETE" })
    setDeleting(false)
    setDeleteTarget(null)
    fetchArticles()
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <PageHeader
        title="Bài viết"
        description={`${total} bài viết`}
        actions={<CreateButton href="/admin/articles/new" label="Viết bài mới" />}
      />

      <FilterBar
        searchValue={search}
        onSearch={setSearch}
        placeholder="Tìm theo tiêu đề..."
        filters={STATUS_FILTERS.map((f) => ({
          ...f,
          active:  f.value === statusFilter,
          onClick: () => setStatusFilter(f.value),
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
        ) : articles.length === 0 ? (
          <EmptyAdmin
            message="Chưa có bài viết nào"
            action={<CreateButton href="/admin/articles/new" label="Viết bài đầu tiên" />}
          />
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_120px_120px_100px_80px] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Tiêu đề</span>
              <span>Danh mục</span>
              <span>Trạng thái</span>
              <span>Ngày đăng</span>
              <span className="text-right">Hành động</span>
            </div>

            <ul className="divide-y divide-border">
              {articles.map((a) => (
                <li key={a.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_100px_80px] gap-2 md:gap-4 px-4 py-3 hover:bg-accent/40 transition-colors items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">/{a.slug}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.category || "—"}</span>
                  <StatusBadge status={a.status} />
                  <span className="text-xs text-muted-foreground">{fmtDate(a.published_at || a.created_at)}</span>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    {a.status === "PUBLISHED" && (
                      <Link
                        href={`/news/${a.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Xem trang"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    )}
                    <Link
                      href={`/admin/articles/${a.id}/edit`}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget({ id: a.id, title: a.title })}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Xóa"
                    >
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
        title="Xóa bài viết?"
        message={`"${deleteTarget?.title}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`}
        confirmLabel="Xóa"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}