// src/app/api/admin/settings/route.js
import { NextResponse }    from "next/server"
import sql                 from "@/lib/db"
import { requireApiAdmin } from "@/lib/auth"
import { z }               from "zod"
import { logger }          from "@/lib/logger"

// Mỗi value phải là string (site_configs lưu string)
const patchSettingsSchema = z.record(
  z.string().min(1, "Key không được rỗng"),
  z.string()
)

export async function GET(req) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const rows = await sql`SELECT key, value, label FROM site_configs ORDER BY key`
  const config = {}
  for (const r of rows) config[r.key] = { value: r.value, label: r.label }
  return NextResponse.json({ config })
}

export async function PATCH(req) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ" }, { status: 400 }) }

  const parsed = patchSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const entries = Object.entries(parsed.data)
  if (!entries.length) return NextResponse.json({ success: true })

  try {
    await Promise.all(
      entries.map(([key, value]) =>
        sql`
          INSERT INTO site_configs (key, value, updated_at)
          VALUES (${key}, ${value}, now())
          ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = now()
        `
      )
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error("PATCH /api/admin/settings failed", err)
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 })
  }
}