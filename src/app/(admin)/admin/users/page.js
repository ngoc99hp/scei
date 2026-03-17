"use client"
// src/app/(admin)/admin/users/page.js

import { useState, useEffect } from "react"
import { Loader2, UserCheck, UserX, KeyRound, Plus } from "lucide-react"
import { PageHeader, ConfirmDialog, inputCls, labelCls } from "@/components/admin/admin-ui"

function fmtDate(d) {
  if (!d) return "Chưa đăng nhập"
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function CreateUserModal({ open, onClose, onCreated }) {
  const [fields,  setFields]  = useState({ email: "", name: "", password: "" })
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)
  async function submit() {
    setError(""); setLoading(true)
    const res  = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || "Lỗi")
    onCreated?.()
  }
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6">
        <h3 className="font-semibold text-foreground mb-4">Tạo tài khoản mới</h3>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="space-y-3">
          <div><label className={labelCls}>Họ tên</label><input value={fields.name} onChange={e => setFields(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Nguyễn Văn A" /></div>
          <div><label className={labelCls}>Email <span className="text-red-500">*</span></label><input type="email" value={fields.email} onChange={e => setFields(p => ({ ...p, email: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Mật khẩu <span className="text-red-500">*</span></label><input type="password" value={fields.password} onChange={e => setFields(p => ({ ...p, password: e.target.value }))} className={inputCls} placeholder="Tối thiểu 8 ký tự" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent">Hủy</button>
          <button onClick={submit} disabled={loading} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-1.5">
            {loading && <Loader2 size={13} className="animate-spin" />} Tạo tài khoản
          </button>
        </div>
      </div>
    </div>
  )
}

function ChangePasswordModal({ user, onClose, onDone }) {
  const [pw,      setPw]      = useState("")
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)
  async function submit() {
    setError(""); setLoading(true)
    const res  = await fetch(`/api/admin/users/${user.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error || "Lỗi")
    onDone?.()
  }
  if (!user) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h3 className="font-semibold text-foreground mb-1">Đổi mật khẩu</h3>
        <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} className={inputCls} placeholder="Mật khẩu mới (tối thiểu 8 ký tự)" />
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="h-9 px-4 rounded-lg border border-border text-sm text-muted-foreground hover:bg-accent">Hủy</button>
          <button onClick={submit} disabled={loading || pw.length < 8} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center gap-1.5">
            {loading && <Loader2 size={13} className="animate-spin" />} Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showCreate,   setShowCreate]   = useState(false)
  const [changePwUser, setChangePwUser] = useState(null)
  const [toggling,     setToggling]     = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch("/api/admin/users")
    const d   = await res.json()
    setUsers(d.users ?? [])
    setLoading(false)
  }
  useEffect(() => { fetchUsers() }, [])

  async function toggleActive(u) {
    setToggling(u.id)
    await fetch(`/api/admin/users/${u.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !u.is_active }) })
    setToggling(null); fetchUsers()
  }

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <PageHeader title="Tài khoản Admin" description={`${users.length} tài khoản`}
        actions={
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            <Plus size={15} /> Tạo tài khoản
          </button>
        }
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="divide-y">{Array.from({length:3}).map((_,i) => <div key={i} className="px-4 py-4 flex gap-4 animate-pulse"><div className="w-9 h-9 rounded-full bg-muted" /><div className="flex-1 space-y-2"><div className="h-4 bg-muted rounded w-1/3" /><div className="h-3 bg-muted rounded w-1/4" /></div></div>)}</div>
        ) : (
          <ul className="divide-y divide-border">
            {users.map(u => (
              <li key={u.id} className="px-4 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-sm font-semibold text-primary">{(u.name ?? u.email)[0].toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{u.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Đăng nhập lần cuối: {fmtDate(u.last_login_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${u.is_active ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                    {u.is_active ? "Hoạt động" : "Vô hiệu"}
                  </span>
                  <button onClick={() => setChangePwUser(u)} title="Đổi mật khẩu"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <KeyRound size={14} />
                  </button>
                  <button onClick={() => toggleActive(u)} disabled={toggling === u.id} title={u.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                    className={`p-1.5 rounded-lg transition-colors ${u.is_active ? "text-muted-foreground hover:text-red-600 hover:bg-red-50" : "text-muted-foreground hover:text-green-600 hover:bg-green-50"}`}>
                    {toggling === u.id ? <Loader2 size={14} className="animate-spin" /> : u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CreateUserModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); fetchUsers() }} />
      <ChangePasswordModal user={changePwUser} onClose={() => setChangePwUser(null)} onDone={() => { setChangePwUser(null) }} />
    </div>
  )
}