// src/lib/cloudinary.js
// Cloudinary upload helper — dùng cho Admin khi upload ảnh
// Docs: https://cloudinary.com/documentation/node_integration

import { v2 as cloudinary } from "cloudinary"

// Cấu hình từ env (chỉ cần 1 lần, module-level singleton)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true, // luôn dùng HTTPS
})

// ── Folder structure trong Cloudinary ──────────────────────
// scei/
//   programs/    ← cover image của chương trình
//   startups/    ← logo + cover của startup
//   mentors/     ← avatar của mentor
//   events/      ← cover image sự kiện
//   articles/    ← cover image bài viết
//   resources/   ← thumbnail tài nguyên
//   misc/        ← ảnh khác

/**
 * Upload 1 file lên Cloudinary
 * @param {string|Buffer} source - URL, base64 string, hoặc file path
 * @param {object} options
 * @param {string} options.folder - Thư mục trong Cloudinary (vd: "scei/mentors")
 * @param {string} [options.publicId] - Tên file custom (nếu không truyền → tự sinh)
 * @param {number} [options.width] - Resize width tối đa
 * @param {number} [options.height] - Resize height tối đa
 * @param {"fill"|"crop"|"scale"|"fit"} [options.crop] - Kiểu crop
 * @returns {Promise<CloudinaryUploadResult>}
 */
export async function uploadImage(source, options = {}) {
  const {
    folder = "scei/misc",
    publicId,
    width,
    height,
    crop = "fill",
  } = options

  const uploadOptions = {
    folder,
    resource_type: "image",
    // Tự động tối ưu format (webp nếu browser hỗ trợ)
    fetch_format: "auto",
    quality: "auto:good",
    // Overwrite nếu cùng publicId
    overwrite: true,
  }

  if (publicId) uploadOptions.public_id = publicId
  if (width || height) {
    uploadOptions.transformation = [{ width, height, crop }]
  }

  try {
    const result = await cloudinary.uploader.upload(source, uploadOptions)
    return {
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error("[Cloudinary] Upload failed:", error)
    return {
      ok: false,
      error: error.message || "Upload thất bại",
    }
  }
}

/**
 * Upload avatar mentor (vuông, 400x400)
 */
export function uploadMentorAvatar(source, mentorSlug) {
  return uploadImage(source, {
    folder: "scei/mentors",
    publicId: mentorSlug,
    width: 400,
    height: 400,
    crop: "fill",
  })
}

/**
 * Upload logo startup (square, 200x200)
 */
export function uploadStartupLogo(source, startupSlug) {
  return uploadImage(source, {
    folder: "scei/startups/logos",
    publicId: `${startupSlug}-logo`,
    width: 200,
    height: 200,
    crop: "fit",
  })
}

/**
 * Upload cover image (16:9, 1200x675)
 */
export function uploadCoverImage(source, folder, slug) {
  return uploadImage(source, {
    folder: `scei/${folder}`,
    publicId: `${slug}-cover`,
    width: 1200,
    height: 675,
    crop: "fill",
  })
}

/**
 * Xóa ảnh khỏi Cloudinary
 * @param {string} publicId - VD: "scei/mentors/dr-minh-tran"
 */
export async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return { ok: result.result === "ok" }
  } catch (error) {
    console.error("[Cloudinary] Delete failed:", error)
    return { ok: false, error: error.message }
  }
}

/**
 * Tạo URL với transformation (resize on-the-fly, không cần upload lại)
 * Dùng khi cần hiển thị ảnh với kích thước khác nhau
 * @param {string} publicId
 * @param {object} transforms
 */
export function getImageUrl(publicId, transforms = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    fetch_format: "auto",
    quality: "auto",
    ...transforms,
  })
}

export default cloudinary