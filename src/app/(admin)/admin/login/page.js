"use client"

// src/app/(admin)/admin/login/page.js
// Trang đăng nhập admin

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react"

export default function AdminLoginPage() {
  const router              = useRouter()
  const [error, setError]   = useState("")
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const form   = new FormData(e.target)
    const result = await signIn("credentials", {
      email:    form.get("email"),
      password: form.get("password"),
      redirect: false,
    })

    if (result?.error) {
      setError("Email hoặc mật khẩu không chính xác")
      setLoading(false)
    } else {
      router.push("/admin")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold">SCEI Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">Đăng nhập để quản lý hệ thống</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@scei.vn"
                disabled={loading}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Mật khẩu</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <a href="/" className="underline hover:text-foreground">← Về trang chủ</a>
        </p>
      </div>
    </div>
  )
}