"use client"
// src/app/(admin)/admin/applications/page.js

import { useState, useEffect, useCallback } from "react"
import { ChevronDown, Loader2 } from "lucide-react"
import {
  PageHeader, FilterBar, StatusBadge, EmptyAdmin, TablePagination,
} from "@/components/admin/admin-ui"

const STATUS_FILTERS = [
  { label: "Tất cả",       value: "" },
  { label: "Chờ duyệt",    value: "PENDING" },
  { label: "Đang xét",     value: "REVIEWING" },
  { label: "Chấp nhận",    value: "APPROVED" },
  { label: "Từ chối",      value: "REJECTED" },
  { label: "Danh sách chờ",value: "WAITLISTED" },
]
const NEXT_STATUS = {
  PENDING:    ["REVIEWING", "APPROVED", "REJECTED", "WAITLISTED"],
  REVIEWING:  ["APPROVED", "REJECTED", "WAITLISTED"],
  APPROVED:   ["REJECTED"],
  REJECTED:   ["REVIEWING"],
  WAITLISTED: ["APPROVED", "REJECTED"],
}
const STATUS_LABEL = { PENDING:"Chờ duyệt", REVIEWING:"Đang xét", APPROVED:"Chấp nhận", REJECTED:"Từ chối", WAITLISTED:"Danh sách chờ" }

function fmtDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

// ── Status update dropdown inline ────────────────────────────
function StatusDropdown({ id, currentStatus, onUpdated }) {
  const [open,    setOpen]    = useState(false)
  const [loading, setLoading] = useState(false)
  const nexts = NEXT_STATUS[currentStatus] ?? []
  if (!nexts.length) return <StatusBadge status={currentStatus} />

  async function update(newStatus) {
    setLoading(true); setOpen(false)
    await fetch(`/api/admin/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) })
    setLoading(false); onUpdated?.()
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} disabled={loading}
        className="flex items-center gap-1 disabled:opacity-60">
        {loading ? <Loader2 size={12} className="animate-spin" /> : <StatusBadge status={currentStatus} />}
        <ChevronDown size={12} className="text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 min-w-[140px] py-1">
            {nexts.map(s => (
              <button key={s} onClick={() => update(s)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors">
                → {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Detail modal ──────────────────────────────────────────────
function DetailModal({ id, onClose, onUpdated }) {
  const [app,     setApp]     = useState(null)
  const [note,    setNote]    = useState("")
  const [saving,  setSaving]  = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/applications/${id}`).then(r => r.json()).then(d => {
      setApp(d.application)
      setNote(d.application?.review_note ?? "")
    })
  }, [id])

  async function saveNote() {
    setSaving(true)
    await fetch(`/api/admin/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: app.status, review_note: note }) })
    setSaving(false); onUpdated?.()
  }

  if (!id) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Chi tiết đơn</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">✕</button>
        </div>
        {!app ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="p-5 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Người đại diện", app.applicant_name],
                ["Email", app.applicant_email],
                ["Điện thoại", app.applicant_phone],
                ["Startup", app.startup_name],
                ["Website", app.startup_website],
                ["Ngành", app.industry],
                ["Giai đoạn", app.stage],
                ["Quy mô team", app.team_size],
                ["Vốn huy động", app.funding_raised],
                ["Chương trình", app.program_name],
              ].map(([label, val]) => val ? (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-medium text-foreground">{val}</p>
                </div>
              ) : null)}
            </div>
            {app.startup_desc && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mô tả startup</p>
                <p className="text-foreground leading-relaxed">{app.startup_desc}</p>
              </div>
            )}
            {app.additional_info && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Thông tin bổ sung</p>
                <p className="text-foreground leading-relaxed">{app.additional_info}</p>
              </div>
            )}
            {app.pitch_deck_url && (
              <a href={app.pitch_deck_url} target="_blank" className="text-primary text-xs underline">Xem Pitch Deck →</a>
            )}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ghi chú nội bộ</p>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
                className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              <button onClick={saveNote} disabled={saving}
                className="mt-2 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-1.5">
                {saving && <Loader2 size={11} className="animate-spin" />} Lưu ghi chú
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  const [items,        setItems]        = useState([])
  const [total,        setTotal]        = useState(0)
  const [totalPages,   setTotalPages]   = useState(1)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [detailId,     setDetailId]     = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, q: search, status: statusFilter })
      const res  = await fetch(`/api/admin/applications?${p}`)
      const data = await res.json()
      setItems(data.applications ?? [])
      setTotal(data.total ?? 0)
      setTotalPages(data.totalPages ?? 1)
    } finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <PageHeader title="Đơn xét tuyển" description={`${total} đơn`} />
      <FilterBar searchValue={search} onSearch={setSearch} placeholder="Tìm theo tên, startup..."
        filters={STATUS_FILTERS.map(f => ({ ...f, active: f.value === statusFilter, onClick: () => setStatusFilter(f.value) }))} />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="px-4 py-3 flex gap-4 animate-pulse"><div className="h-4 bg-muted rounded w-1/3" /><div className="h-4 bg-muted rounded w-20 ml-auto" /></div>)}</div>
        ) : items.length === 0 ? (
          <EmptyAdmin message="Chưa có đơn nào" />
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_140px_130px_120px_80px] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Startup / Người nộp</span><span>Chương trình</span><span>Trạng thái</span><span>Ngày nộp</span><span className="text-right">Chi tiết</span>
            </div>
            <ul className="divide-y divide-border">
              {items.map(a => (
                <li key={a.id} className="grid grid-cols-1 md:grid-cols-[1fr_140px_130px_120px_80px] gap-2 md:gap-4 px-4 py-3 hover:bg-accent/40 items-center">
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.startup_name}</p>
                    <p className="text-xs text-muted-foreground">{a.applicant_name}</p>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{a.program_name || "—"}</span>
                  <StatusDropdown id={a.id} currentStatus={a.status} onUpdated={fetchData} />
                  <span className="text-xs text-muted-foreground">{fmtDate(a.created_at)}</span>
                  <div className="flex justify-end">
                    <button onClick={() => setDetailId(a.id)} className="text-xs text-primary hover:underline">Xem →</button>
                  </div>
                </li>
              ))}
            </ul>
            <TablePagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </div>
      <DetailModal id={detailId} onClose={() => setDetailId(null)} onUpdated={() => { fetchData(); setDetailId(null) }} />
    </div>
  )
}