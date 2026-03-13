// src/app/api/admin/settings/route.js
// GET  — lấy toàn bộ site_configs
// PATCH — cập nhật nhiều keys cùng lúc (upsert)

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import sql from "@/lib/db"

async function requireAdmin() {
  const s = await getServerSession(authOptions)
  if (!s || s.user.role !== "ADMIN") return null
  return s
}

export async function GET(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rows = await sql`SELECT key, value, label FROM site_configs ORDER BY key`
  // Convert to { key: { value, label } }
  const config = {}
  for (const r of rows) config[r.key] = { value: r.value, label: r.label }
  return NextResponse.json({ config })
}

export async function PATCH(req) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  // body = { key: value, ... }
  const entries = Object.entries(body)
  if (!entries.length) return NextResponse.json({ success: true })

  // Upsert từng key
  await Promise.all(
    entries.map(([key, value]) =>
      sql`
        INSERT INTO site_configs (key, value, updated_at)
        VALUES (${key}, ${String(value)}, now())
        ON CONFLICT (key) DO UPDATE SET value = ${String(value)}, updated_at = now()
      `
    )
  )
  return NextResponse.json({ success: true })
}