// src/app/api/admin/upload/route.js
// API endpoint để Admin upload ảnh lên Cloudinary
// Protected bởi middleware — chỉ admin đã đăng nhập mới dùng được

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { uploadImage } from "@/lib/cloudinary"

// Giới hạn kích thước file: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Các loại file cho phép
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]

// Map folder theo entity type
const FOLDER_MAP = {
  mentor:   "scei/mentors",
  startup:  "scei/startups",
  program:  "scei/programs",
  event:    "scei/events",
  article:  "scei/articles",
  resource: "scei/resources",
  misc:     "scei/misc",
}

// Map kích thước ảnh theo type
const SIZE_MAP = {
  mentor:   { width: 400,  height: 400,  crop: "fill" },  // Avatar vuông
  startup:  { width: 800,  height: 600,  crop: "fill" },  // Cover 4:3
  program:  { width: 1200, height: 675,  crop: "fill" },  // Cover 16:9
  event:    { width: 1200, height: 675,  crop: "fill" },  // Cover 16:9
  article:  { width: 1200, height: 630,  crop: "fill" },  // OG image
  resource: { width: 800,  height: 600,  crop: "fill" },  // Thumbnail
  misc:     { width: 1200, height: 900,  crop: "limit" }, // Giữ tỉ lệ
}

export async function POST(request) {
  // 1. Kiểm tra auth
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // 2. Parse multipart form data
    const formData = await request.formData()
    const file = formData.get("file")
    const type = formData.get("type") || "misc"  // entity type
    const slug = formData.get("slug") || ""       // để đặt tên file

    // 3. Validate file
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Không tìm thấy file" },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Chỉ chấp nhận: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File quá lớn. Tối đa 5MB." },
        { status: 400 }
      )
    }

    // 4. Convert File → base64 để upload lên Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    // 5. Xác định folder và publicId
    const folder = FOLDER_MAP[type] || FOLDER_MAP.misc
    const sizeConfig = SIZE_MAP[type] || SIZE_MAP.misc
    const publicId = slug
      ? `${slug}-${Date.now()}`
      : `upload-${Date.now()}`

    // 6. Upload lên Cloudinary
    const result = await uploadImage(base64, {
      folder,
      publicId,
      ...sizeConfig,
    })

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "Upload thất bại" },
        { status: 500 }
      )
    }

    // 7. Trả về URL đã upload
    return NextResponse.json({
      ok: true,
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
    })
  } catch (error) {
    console.error("[Upload API] Error:", error)
    return NextResponse.json(
      { error: "Lỗi server khi upload" },
      { status: 500 }
    )
  }
}

// Giới hạn body size cho route này
export const config = {
  api: {
    bodyParser: false,
  },
}