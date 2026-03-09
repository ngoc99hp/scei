// src/app/api/contact/route.js
// POST /api/contact — Lưu form liên hệ vào bảng contacts
// Rate limit được xử lý ở middleware.js

import { NextResponse } from "next/server"
import sql from "@/lib/db"
import { contactSchema } from "@/lib/validations"

export async function POST(req) {
  try {
    // 1. Parse body
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: "Request body không hợp lệ." }, { status: 400 })
    }

    // 2. Validate
    const result = contactSchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return NextResponse.json({ error: "Dữ liệu không hợp lệ.", fields: errors }, { status: 422 })
    }

    const { fullName, organization, email, phone, subject, message, website } = result.data

    // 3. Honeypot check (website phải rỗng)
    if (website) {
      // Trả 200 giả để bot không biết bị block
      return NextResponse.json({ success: true })
    }

    // 4. Kiểm tra duplicate: cùng email + subject trong 1 giờ qua
    const recent = await sql`
      SELECT id FROM contacts
      WHERE email    = ${email}
        AND subject  = ${subject}
        AND created_at > NOW() - INTERVAL '1 hour'
      LIMIT 1
    `
    if (recent.length > 0) {
      return NextResponse.json(
        { error: "Bạn đã gửi yêu cầu tương tự gần đây. Vui lòng thử lại sau 1 giờ." },
        { status: 429 }
      )
    }

    // 5. Lưu vào DB
    await sql`
      INSERT INTO contacts
        (full_name, organization, email, phone, subject, message, status)
      VALUES
        (${fullName}, ${organization ?? null}, ${email}, ${phone}, ${subject}, ${message}, 'NEW')
    `

    return NextResponse.json(
      { success: true, message: "Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 1-2 ngày làm việc." },
      { status: 201 }
    )
  } catch (err) {
    console.error("[POST /api/contact]", err)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}