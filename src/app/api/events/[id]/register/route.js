// src/app/api/events/[id]/register/route.js
// POST /api/events/[id]/register — Đăng ký tham dự sự kiện
// Rate limit được xử lý ở middleware.js

import { NextResponse } from "next/server"
import sql from "@/lib/db"
import { eventRegistrationSchema } from "@/lib/validations"
import { incrementEventRegistration } from "@/lib/queries/events"

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

    // 2. Validate
    const result = eventRegistrationSchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return NextResponse.json({ error: "Dữ liệu không hợp lệ.", fields: errors }, { status: 422 })
    }

    const { name, email, phone, organization, note } = result.data

    // 3. Kiểm tra event tồn tại, đã publish và còn mở đăng ký
    const events = await sql`
      SELECT id, title, status, max_attendees, registered_count, register_deadline
      FROM events
      WHERE id = ${id} AND is_published = true
      LIMIT 1
    `
    if (events.length === 0) {
      return NextResponse.json({ error: "Sự kiện không tồn tại." }, { status: 404 })
    }

    const event = events[0]

    // Kiểm tra trạng thái có thể đăng ký
    if (!["OPEN", "DRAFT"].includes(event.status)) {
      return NextResponse.json(
        { error: "Sự kiện hiện không nhận đăng ký." },
        { status: 400 }
      )
    }

    // Kiểm tra deadline đăng ký
    if (event.register_deadline && new Date(event.register_deadline) < new Date()) {
      return NextResponse.json(
        { error: "Đã hết hạn đăng ký sự kiện này." },
        { status: 400 }
      )
    }

    // Kiểm tra còn chỗ không
    if (
      event.max_attendees &&
      event.registered_count >= event.max_attendees
    ) {
      return NextResponse.json(
        { error: "Sự kiện đã đủ số lượng người tham dự." },
        { status: 400 }
      )
    }

    // 4. Kiểm tra duplicate: email đã đăng ký event này chưa
    const existing = await sql`
      SELECT id FROM event_registrations
      WHERE event_id = ${id} AND email = ${email}
      LIMIT 1
    `
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email này đã đăng ký sự kiện trước đó." },
        { status: 409 }
      )
    }

    // 5. Lưu đăng ký + tăng counter (trong transaction)
    await sql`
      INSERT INTO event_registrations
        (event_id, name, email, phone, organization, note, status)
      VALUES
        (${id}, ${name}, ${email}, ${phone ?? null}, ${organization ?? null}, ${note ?? null}, 'REGISTERED')
    `

    await incrementEventRegistration(id)

    return NextResponse.json(
      {
        success: true,
        message: `Đăng ký thành công! Chúng tôi sẽ gửi thông tin chi tiết đến ${email}.`,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error("[POST /api/events/[id]/register]", err)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}