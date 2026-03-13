// src/app/api/admin/applications/route.js
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
  const status = searchParams.get("status") || ""
  const programId = searchParams.get("program_id") || ""
  const search = searchParams.get("q") || ""
  const PAGE_SIZE = 20
  const offset = (page - 1) * PAGE_SIZE

  let rows, countRows
  if (status && search) {
    rows = await sql`SELECT a.*, p.name program_name FROM applications a LEFT JOIN programs p ON a.program_id = p.id WHERE a.status = ${status}::"ApplicationStatus" AND (a.applicant_name ILIKE ${"%" + search + "%"} OR a.startup_name ILIKE ${"%" + search + "%"}) ORDER BY a.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM applications WHERE status = ${status}::"ApplicationStatus" AND (applicant_name ILIKE ${"%" + search + "%"} OR startup_name ILIKE ${"%" + search + "%"})`
  } else if (status) {
    rows = await sql`SELECT a.*, p.name program_name FROM applications a LEFT JOIN programs p ON a.program_id = p.id WHERE a.status = ${status}::"ApplicationStatus" ORDER BY a.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM applications WHERE status = ${status}::"ApplicationStatus"`
  } else if (programId) {
    rows = await sql`SELECT a.*, p.name program_name FROM applications a LEFT JOIN programs p ON a.program_id = p.id WHERE a.program_id = ${programId} ORDER BY a.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM applications WHERE program_id = ${programId}`
  } else if (search) {
    rows = await sql`SELECT a.*, p.name program_name FROM applications a LEFT JOIN programs p ON a.program_id = p.id WHERE a.applicant_name ILIKE ${"%" + search + "%"} OR a.startup_name ILIKE ${"%" + search + "%"} ORDER BY a.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM applications WHERE applicant_name ILIKE ${"%" + search + "%"} OR startup_name ILIKE ${"%" + search + "%"}`
  } else {
    rows = await sql`SELECT a.*, p.name program_name FROM applications a LEFT JOIN programs p ON a.program_id = p.id ORDER BY a.created_at DESC LIMIT ${PAGE_SIZE} OFFSET ${offset}`
    countRows = await sql`SELECT COUNT(*) c FROM applications`
  }
  return NextResponse.json({ applications: rows, total: Number(countRows[0]?.c ?? 0), totalPages: Math.ceil(Number(countRows[0]?.c ?? 0) / PAGE_SIZE), page })
}