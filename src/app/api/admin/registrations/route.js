// src/app/api/admin/registrations/route.js
// GET — danh sách đăng ký, filter theo event
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
  const { searchParams } = new URL(req.url)
  const page = Math.max(1, Number(searchParams.get("page") || 1))
  const eventId = searchParams.get("event_id") || ""
  const search = searchParams.get("q") || ""
  const format = searchParams.get("format") || ""  // "csv"
  const PAGE_SIZE = 50
  const offset = (page - 1) * PAGE_SIZE

  let rows, countRows
  if (eventId && search) {
    rows = await sql`SELECT er.*, e.title event_title, e.slug event_slug FROM event_registrations er JOIN events e ON er.event_id = e.id WHERE er.event_id = ${eventId} AND (er.name ILIKE ${"%" + search + "%"} OR er.email ILIKE ${"%" + search + "%"}) ORDER BY er.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM event_registrations er WHERE event_id = ${eventId} AND (name ILIKE ${"%" + search + "%"} OR email ILIKE ${"%" + search + "%"})`
  } else if (eventId) {
    rows = await sql`SELECT er.*, e.title event_title, e.slug event_slug FROM event_registrations er JOIN events e ON er.event_id = e.id WHERE er.event_id = ${eventId} ORDER BY er.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM event_registrations WHERE event_id = ${eventId}`
  } else if (search) {
    rows = await sql`SELECT er.*, e.title event_title, e.slug event_slug FROM event_registrations er JOIN events e ON er.event_id = e.id WHERE er.name ILIKE ${"%" + search + "%"} OR er.email ILIKE ${"%" + search + "%"} ORDER BY er.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM event_registrations WHERE name ILIKE ${"%" + search + "%"} OR email ILIKE ${"%" + search + "%"}`
  } else {
    rows = await sql`SELECT er.*, e.title event_title, e.slug event_slug FROM event_registrations er JOIN events e ON er.event_id = e.id ORDER BY er.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM event_registrations`
  }

  // CSV export
  if (format === "csv") {
    const csvRows = format === "csv" ? await sql`SELECT er.name, er.email, er.phone, er.organization, er.note, er.created_at, e.title event_title FROM event_registrations er JOIN events e ON er.event_id = e.id ${eventId ? sql`WHERE er.event_id = ${eventId}` : sql``} ORDER BY er.created_at DESC` : []
    const header = "Họ tên,Email,Điện thoại,Tổ chức,Ghi chú,Ngày đăng ký,Sự kiện"
    const csvContent = [
      header,
      ...rows.map(r => `"${r.name ?? ""}","${r.email ?? ""}","${r.phone ?? ""}","${r.organization ?? ""}","${(r.note ?? "").replace(/"/g, '""')}","${r.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : ""}","${r.event_title ?? ""}"`),
    ].join("\n")
    return new Response("\uFEFF" + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="registrations.csv"`,
      },
    })
  }

  return NextResponse.json({ registrations: rows, total: Number(countRows[0]?.c ?? 0), totalPages: Math.ceil(Number(countRows[0]?.c ?? 0) / PAGE_SIZE), page })
}