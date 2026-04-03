// src/app/api/admin/upload/route.js
// API endpoint để Admin upload ảnh lên Cloudinary
// Protected bởi requireApiAdmin() — chỉ admin đã đăng nhập mới dùng được

import { NextResponse }    from "next/server"
import { uploadImage }     from "@/lib/cloudinary"
import { requireApiAdmin } from "@/lib/auth"
import { logger }          from "@/lib/logger"

export const dynamic = "force-dynamic"

// Giới hạn kích thước file: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Các MIME type cho phép (header)
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]

/**
 * Magic bytes cho từng định dạng ảnh.
 * Validate THỰC SỰ từ binary content — không tin vào Content-Type header
 * vì client có thể gửi file.type bất kỳ.
 *
 * JPEG : FF D8 FF
 * PNG  : 89 50 4E 47  (‌\x89PNG)
 * WebP : 52 49 46 46 ?? ?? ?? ?? 57 45 42 50  (RIFF????WEBP)
 * GIF  : 47 49 46 38  (GIF8)
 */
const MAGIC_BYTES = [
  {
    mime:   "image/jpeg",
    check:  (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF,
  },
  {
    mime:   "image/png",
    check:  (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47,
  },
  {
    mime:   "image/webp",
    // RIFF (4 bytes) + size (4 bytes) + WEBP (4 bytes)
    check:  (b) =>
      b[0]  === 0x52 && b[1]  === 0x49 && b[2]  === 0x46 && b[3]  === 0x46 &&
      b[8]  === 0x57 && b[9]  === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    mime:   "image/gif",
    check:  (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38,
  },
]

/**
 * Kiểm tra magic bytes của buffer, trả về MIME type thực hoặc null nếu không hợp lệ.
 * @param {Uint8Array} bytes
 * @returns {string|null}
 */
function detectMimeFromBytes(bytes) {
  for (const { mime, check } of MAGIC_BYTES) {
    if (check(bytes)) return mime
  }
  return null
}

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
  const auth = await requireApiAdmin()
  if (!auth.ok) return auth.res

  try {
    // 2. Parse multipart form data
    const formData = await request.formData()
    const file = formData.get("file")
    const type = formData.get("type") || "misc"  // entity type
    const slug = formData.get("slug") || ""       // để đặt tên file

    // 3. Validate file tồn tại
    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Không tìm thấy file" },
        { status: 400 }
      )
    }

    // 4. Validate MIME type từ header trước (quick check)
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Chỉ chấp nhận: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      )
    }

    // 5. Validate kích thước
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File quá lớn. Tối đa 5MB." },
        { status: 400 }
      )
    }

    // 6. Đọc binary và validate magic bytes
    //    Bước này quan trọng: ngay cả khi header bị fake, nội dung thực
    //    của file phải khớp với định dạng ảnh hợp lệ.
    const bytes    = await file.arrayBuffer()
    const uint8    = new Uint8Array(bytes)
    const realMime = detectMimeFromBytes(uint8)

    if (!realMime) {
      logger.warn("Upload rejected: magic bytes mismatch", {
        declaredType: file.type,
        size:         file.size,
        user:         auth.session.user.email,
      })
      return NextResponse.json(
        { error: "File không hợp lệ — nội dung không khớp định dạng ảnh" },
        { status: 400 }
      )
    }

    // Optional: cảnh báo nếu header khác magic bytes (có thể là lỗi client)
    if (realMime !== file.type && !(file.type === "image/jpg" && realMime === "image/jpeg")) {
      logger.warn("Upload: MIME type mismatch between header and magic bytes", {
        declaredType: file.type,
        detectedType: realMime,
        user:         auth.session.user.email,
      })
    }

    // 7. Convert File → base64 để upload lên Cloudinary
    const buffer = Buffer.from(bytes)
    const base64 = `data:${realMime};base64,${buffer.toString("base64")}`

    // 8. Xác định folder và publicId
    const folder     = FOLDER_MAP[type] || FOLDER_MAP.misc
    const sizeConfig = SIZE_MAP[type]   || SIZE_MAP.misc
    const publicId   = slug
      ? `${slug}-${Date.now()}`
      : `upload-${Date.now()}`

    // 9. Upload lên Cloudinary
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

    // 10. Trả về URL đã upload
    return NextResponse.json({
      ok:       true,
      url:      result.url,
      publicId: result.publicId,
      width:    result.width,
      height:   result.height,
    })
  } catch (error) {
    logger.error("[Upload API] Unhandled error", error, { user: auth?.session?.user?.email })
    return NextResponse.json(
      { error: "Lỗi server khi upload" },
      { status: 500 }
    )
  }
}