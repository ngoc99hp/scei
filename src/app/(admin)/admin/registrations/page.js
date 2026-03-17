"use client"
// src/app/(admin)/admin/registrations/page.js

import { useState, useEffect, useCallback } from "react"
import { Download, Filter } from "lucide-react"
import {
  PageHeader, FilterBar, EmptyAdmin, TablePagination,
} from "@/components/admin/admin-ui"

function fmtDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function RegistrationsPage() {
  const [items,      setItems]      = useState([])
  const [total,      setTotal]      = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState("")
  const [events,     setEvents]     = useState([])
  const [eventFilter,setEventFilter]= useState("")

  // Load danh sách events để filter
  useEffect(() => {
    fetch("/api/admin/events?page=1")
      .then(r => r.json())
      .then(d => setEvents(d.events ?? []))
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, q: search, event_id: eventFilter })
      const res  = await fetch(`/api/admin/registrations?${p}`)
      const data = await res.json()
      setItems(data.registrations ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
    } finally { setLoading(false) }
  }, [page, search, eventFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search, eventFilter])

  function handleExportCSV() {
    const p = new URLSearchParams({ format: "csv", event_id: eventFilter })
    window.open(`/api/admin/registrations?${p}`, "_blank")
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <PageHeader
        title="Đăng ký sự kiện"
        description={`${total} lượt đăng ký`}
        actions={
          <button onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Download size={14} /> Xuất CSV
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Search */}
        <FilterBar searchValue={search} onSearch={setSearch} placeholder="Tìm theo tên, email..." />
        {/* Event filter */}
        <select
          value={eventFilter}
          onChange={e => setEventFilter(e.target.value)}
          className="h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-50"
        >
          <option value="">Tất cả sự kiện</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y">{Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex gap-4 animate-pulse"><div className="h-4 bg-muted rounded w-1/4" /><div className="h-4 bg-muted rounded w-1/4 ml-auto" /></div>
          ))}</div>
        ) : items.length === 0 ? (
          <EmptyAdmin message="Chưa có lượt đăng ký nào" />
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_160px_130px_140px_160px] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Họ tên / Tổ chức</span><span>Email</span><span>Điện thoại</span><span>Sự kiện</span><span>Ngày đăng ký</span>
            </div>
            <ul className="divide-y divide-border">
              {items.map(r => (
                <li key={r.id} className="grid grid-cols-1 md:grid-cols-[1fr_160px_130px_140px_160px] gap-2 md:gap-4 px-4 py-3 hover:bg-accent/40 items-center">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    {r.organization && <p className="text-xs text-muted-foreground">{r.organization}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{r.email}</span>
                  <span className="text-xs text-muted-foreground">{r.phone || "—"}</span>
                  <span className="text-xs text-foreground truncate">{r.event_title}</span>
                  <span className="text-xs text-muted-foreground">{fmtDate(r.created_at)}</span>
                </li>
              ))}
            </ul>
            <TablePagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  )
}