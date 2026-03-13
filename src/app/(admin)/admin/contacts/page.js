"use client"
// src/app/(admin)/admin/contacts/page.js

import { useState, useEffect, useCallback } from "react"
import { Loader2, ChevronDown, Trash2 } from "lucide-react"
import {
  PageHeader, FilterBar, StatusBadge, EmptyAdmin,
  TablePagination, ConfirmDialog,
} from "@/components/admin/admin-ui"

const STATUS_FILTERS = [
  { label: "Tất cả",       value: "" },
  { label: "Mới",          value: "NEW" },
  { label: "Đang đọc",     value: "READING" },
  { label: "Đã trả lời",   value: "REPLIED" },
  { label: "Đã đóng",      value: "CLOSED" },
]
const SUBJECT_VI = { "hop-tac": "Hợp tác", "uom-tao": "Ươm tạo", "ho-tro": "Hỗ trợ", "khac": "Khác" }
const NEXT_STATUS_CONTACT = {
  NEW:     ["READING", "REPLIED", "CLOSED"],
  READING: ["REPLIED", "CLOSED"],
  REPLIED: ["CLOSED"],
  CLOSED:  [],
}
const STATUS_LABEL_C = { NEW: "Mới", READING: "Đang đọc", REPLIED: "Đã trả lời", CLOSED: "Đóng" }

function fmtDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function ContactStatusDropdown({ id, current, onUpdated }) {
  const [open, setOpen] = useState(false)
  const nexts = NEXT_STATUS_CONTACT[current] ?? []
  if (!nexts.length) return <StatusBadge status={current} />
  async function update(s) {
    setOpen(false)
    await fetch(`/api/admin/contacts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: s }) })
    onUpdated?.()
  }
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1">
        <StatusBadge status={current} /><ChevronDown size={12} className="text-muted-foreground" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-20 min-w-[140px] py-1">
            {nexts.map(s => <button key={s} onClick={() => update(s)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors">→ {STATUS_LABEL_C[s]}</button>)}
          </div>
        </>
      )}
    </div>
  )
}

function ContactDetail({ id, onClose, onUpdated }) {
  const [contact, setContact] = useState(null)
  const [note, setNote]       = useState("")
  const [saving, setSaving]   = useState(false)
  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/contacts/${id}`).then(r => r.json()).then(d => { setContact(d.contact); setNote(d.contact?.admin_note ?? "") })
  }, [id])
  async function save() {
    setSaving(true)
    await fetch(`/api/admin/contacts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: contact.status, admin_note: note }) })
    setSaving(false); onUpdated?.()
  }
  if (!id) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Chi tiết liên hệ</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        {!contact ? <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div> : (
          <div className="p-5 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[["Họ tên", contact.full_name], ["Email", contact.email], ["Điện thoại", contact.phone], ["Tổ chức", contact.organization], ["Chủ đề", SUBJECT_VI[contact.subject] ?? contact.subject]].map(([l, v]) => v ? (
                <div key={l}><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{v}</p></div>
              ) : null)}
            </div>
            <div><p className="text-xs text-muted-foreground mb-1">Nội dung</p><p className="text-foreground leading-relaxed whitespace-pre-wrap bg-muted/50 rounded-lg p-3">{contact.message}</p></div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Ghi chú nội bộ</p>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              <button onClick={save} disabled={saving} className="mt-2 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-1.5">
                {saving && <Loader2 size={11} className="animate-spin" />} Lưu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const [items, setItems]               = useState([])
  const [total, setTotal]               = useState(0)
  const [totalPages, setTotalPages]     = useState(1)
  const [page, setPage]                 = useState(1)
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [detailId, setDetailId]         = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, q: search, status: statusFilter })
      const res = await fetch(`/api/admin/contacts?${p}`)
      const data = await res.json()
      setItems(data.contacts ?? []); setTotal(data.total ?? 0); setTotalPages(data.totalPages ?? 1)
    } finally { setLoading(false) }
  }, [page, search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/admin/contacts/${deleteTarget.id}`, { method: "DELETE" })
    setDeleting(false); setDeleteTarget(null); fetchData()
  }

  return (
    <div className="p-5 max-w-7xl mx-auto">
      <PageHeader title="Liên hệ" description={`${total} liên hệ`} />
      <FilterBar searchValue={search} onSearch={setSearch} placeholder="Tìm theo tên, email..."
        filters={STATUS_FILTERS.map(f => ({ ...f, active: f.value === statusFilter, onClick: () => setStatusFilter(f.value) }))} />
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? <div className="divide-y">{Array.from({length:6}).map((_,i) => <div key={i} className="px-4 py-3 flex gap-4 animate-pulse"><div className="h-4 bg-muted rounded w-1/3" /><div className="h-4 bg-muted rounded w-20 ml-auto" /></div>)}</div>
        : items.length === 0 ? <EmptyAdmin message="Chưa có liên hệ nào" />
        : (
          <>
            <div className="hidden md:grid grid-cols-[1fr_140px_100px_100px_80px] gap-4 px-4 py-2.5 bg-muted border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Họ tên / Tổ chức</span><span>Email</span><span>Chủ đề</span><span>Trạng thái</span><span className="text-right">Hành động</span>
            </div>
            <ul className="divide-y divide-border">
              {items.map(c => (
                <li key={c.id} className="grid grid-cols-1 md:grid-cols-[1fr_140px_100px_100px_80px] gap-2 md:gap-4 px-4 py-3 hover:bg-accent/40 items-center">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.full_name}</p>
                    {c.organization && <p className="text-xs text-muted-foreground">{c.organization}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground truncate">{c.email}</span>
                  <span className="text-xs text-muted-foreground">{SUBJECT_VI[c.subject] ?? c.subject}</span>
                  <ContactStatusDropdown id={c.id} current={c.status} onUpdated={fetchData} />
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setDetailId(c.id)} className="text-xs text-primary hover:underline">Xem →</button>
                    <button onClick={() => setDeleteTarget({ id: c.id, title: c.full_name })} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </li>
              ))}
            </ul>
            <TablePagination page={page} totalPages={totalPages} onPage={setPage} />
          </>
        )}
      </div>
      <ContactDetail id={detailId} onClose={() => setDetailId(null)} onUpdated={() => { fetchData(); setDetailId(null) }} />
      <ConfirmDialog open={!!deleteTarget} title="Xóa liên hệ?" message={`"${deleteTarget?.title}" sẽ bị xóa vĩnh viễn.`} confirmLabel="Xóa" danger loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}