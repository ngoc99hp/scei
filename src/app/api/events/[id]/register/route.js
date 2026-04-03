// src/app/api/events/[id]/register/route.js
// POST /api/events/[id]/register — Đăng ký tham dự sự kiện
// Rate limit được xử lý ở middleware.js

import { NextResponse } from "next/server"
import { eventRegistrationSchema } from "@/lib/validations"
import { registerForEvent } from "@/lib/queries/events"

export async function POST(req, { params }) {
  try {
    const { id } = await params

    // 1. Parse body
    let body
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { error: "Request body không hợp lệ." },
        { status: 400 }
      )
    }

    // 2. Validate
    const result = eventRegistrationSchema.safeParse(body)
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ.", fields: errors },
        { status: 422 }
      )
    }

    const { name, email, phone, organization, note } = result.data

    // 3. Thực hiện đăng ký trong atomic transaction
    //    (kiểm tra event, deadline, capacity, duplicate, insert, update counter)
    const registration = await registerForEvent(id, {
      name,
      email,
      phone,
      organization,
      note,
    })

    if (!registration.success) {
      return NextResponse.json(
        { error: registration.error },
        { status: registration.httpStatus }
      )
    }

    return NextResponse.json(
      { success: true, message: registration.message },
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