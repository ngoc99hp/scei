// src/app/api/admin/programs/[id]/route.js
// GET   /api/admin/programs/[id] — lấy chi tiết program để edit
// PATCH /api/admin/programs/[id] — cập nhật program (bao gồm content)

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import sql from "@/lib/db"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") return null
  return session
}

export async function GET(req, { params }) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const rows = await sql`SELECT * FROM programs WHERE id = ${id} LIMIT 1`
  if (!rows[0]) return NextResponse.json({ error: "Không tìm thấy." }, { status: 404 })
  return NextResponse.json({ program: rows[0] })
}

export async function PATCH(req, { params }) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params

  let body
  try { body = await req.json() }
  catch { return NextResponse.json({ error: "Body không hợp lệ." }, { status: 400 }) }

  const {
    name, slug, type, status, short_desc,
    description, content, max_applicants,
    is_published, is_featured,
  } = body

  await sql`
    UPDATE programs SET
      name           = ${name         ?? null},
      slug           = ${slug         ?? null},
      type           = ${type         ?? null}::"ProgramType",
      status         = ${status       ?? null}::"ProgramStatus",
      short_desc     = ${short_desc   ?? null},
      description    = ${description  ?? null},
      content        = ${content      || null},
      max_applicants = ${max_applicants ? Number(max_applicants) : null},
      is_published   = ${is_published ?? false},
      is_featured    = ${is_featured  ?? false},
      updated_at     = now()
    WHERE id = ${id}
  `
  return NextResponse.json({ success: true })
}