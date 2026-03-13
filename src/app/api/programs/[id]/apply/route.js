// src/app/api/programs/[id]/apply/route.js
// POST /api/programs/[id]/apply — Nộp đơn tham gia chương trình
// Rate limit được xử lý ở middleware.js

import { NextResponse } from "next/server"
import sql from "@/lib/db"
import { applicationSchema } from "@/lib/validations"

export async function POST(req, { params }) {
  try {
    const { id } = await params

    // 1. Parse body
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Request body không hợp lệ." }, { status: 400 })
    }

    // 2. Validate (inject programId từ URL vào body trước khi validate)
    const result = applicationSchema.safeParse({ ...body, programId: id })
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return NextResponse.json({ error: "Dữ liệu không hợp lệ.", fields: errors }, { status: 422 })
    }

    const {
      applicantName,
      applicantEmail,
      applicantPhone,
      startupName,
      startupWebsite,
      startupDesc,
      teamSize,
      industry,
      stage,
      fundingRaised,
      pitchDeckUrl,
      additionalInfo,
      website, // honeypot
    } = result.data

    // 3. Honeypot
    if (website) {
      return NextResponse.json({ success: true })
    }

    // 4. Kiểm tra program tồn tại, đã publish và đang mở nhận đơn
    const programs = await sql`
      SELECT id, name, status, max_applicants, apply_deadline
      FROM programs
      WHERE id = ${id} AND is_published = true
      LIMIT 1
    `
    if (programs.length === 0) {
      return NextResponse.json({ error: "Chương trình không tồn tại." }, { status: 404 })
    }

    const program = programs[0]

    if (program.status !== "OPEN") {
      return NextResponse.json(
        { error: "Chương trình hiện không nhận đơn đăng ký." },
        { status: 400 }
      )
    }

    // Kiểm tra deadline nộp đơn
    if (program.apply_deadline && new Date(program.apply_deadline) < new Date()) {
      return NextResponse.json(
        { error: "Đã hết hạn nộp đơn cho chương trình này." },
        { status: 400 }
      )
    }

    // Kiểm tra số lượng đơn tối đa
    if (program.max_applicants) {
      const countRows = await sql`
        SELECT COUNT(*) as count FROM applications WHERE program_id = ${id}
      `
      const count = Number(countRows[0]?.count ?? 0)
      if (count >= program.max_applicants) {
        return NextResponse.json(
          { error: "Chương trình đã đủ số lượng đơn đăng ký." },
          { status: 400 }
        )
      }
    }

    // 5. Kiểm tra duplicate: cùng email đã nộp đơn chương trình này chưa
    const existing = await sql`
      SELECT id FROM applications
      WHERE program_id = ${id} AND applicant_email = ${applicantEmail}
      LIMIT 1
    `
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email này đã nộp đơn cho chương trình này trước đó." },
        { status: 409 }
      )
    }

    // 6. Lưu đơn đăng ký
    await sql`
      INSERT INTO applications (
        program_id,
        applicant_name,
        applicant_email,
        applicant_phone,
        startup_name,
        startup_website,
        startup_desc,
        team_size,
        industry,
        stage,
        funding_raised,
        pitch_deck_url,
        additional_info,
        status
      ) VALUES (
        ${id},
        ${applicantName},
        ${applicantEmail},
        ${applicantPhone},
        ${startupName},
        ${startupWebsite ?? null},
        ${startupDesc},
        ${teamSize},
        ${industry},
        ${stage},
        ${fundingRaised ?? null},
        ${pitchDeckUrl ?? null},
        ${additionalInfo ?? null},
        'PENDING'
      )
    `

    return NextResponse.json(
      {
        success: true,
        message: `Nộp đơn thành công! Chúng tôi sẽ xem xét và liên hệ qua email ${applicantEmail} trong 5-7 ngày làm việc.`,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("[POST /api/programs/[id]/apply]", err)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}