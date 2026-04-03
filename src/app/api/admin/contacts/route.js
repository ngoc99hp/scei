// src/app/api/admin/contacts/route.js
import { NextResponse }    from "next/server"
import sql                 from "@/lib/db"
import { requireApiAdmin } from "@/lib/auth"

export async function GET(req) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  const { searchParams } = new URL(req.url)
  const page     = Math.max(1, Number(searchParams.get("page") || 1))
  const status   = searchParams.get("status") || ""
  const search   = searchParams.get("q")      || ""
  const PAGE_SIZE = 20
  const offset   = (page - 1) * PAGE_SIZE

  let rows, countRows
  if (status && search) {
    rows      = await sql`SELECT id, full_name, organization, email, phone, subject, status, created_at FROM contacts WHERE status = ${status}::"ContactStatus" AND (full_name ILIKE ${"%" + search + "%"} OR email ILIKE ${"%" + search + "%"}) ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM contacts WHERE status = ${status}::"ContactStatus" AND (full_name ILIKE ${"%" + search + "%"} OR email ILIKE ${"%" + search + "%"})`
  } else if (status) {
    rows      = await sql`SELECT id, full_name, organization, email, phone, subject, status, created_at FROM contacts WHERE status = ${status}::"ContactStatus" ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM contacts WHERE status = ${status}::"ContactStatus"`
  } else if (search) {
    rows      = await sql`SELECT id, full_name, organization, email, phone, subject, status, created_at FROM contacts WHERE full_name ILIKE ${"%" + search + "%"} OR email ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM contacts WHERE full_name ILIKE ${"%" + search + "%"} OR email ILIKE ${"%" + search + "%"}`
  } else {
    rows      = await sql`SELECT id, full_name, organization, email, phone, subject, status, created_at FROM contacts ORDER BY created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM contacts`
  }

  return NextResponse.json({
    contacts:   rows,
    total:      Number(countRows[0]?.c ?? 0),
    totalPages: Math.ceil(Number(countRows[0]?.c ?? 0) / PAGE_SIZE),
    page,
  })
}