// src/lib/errors.js
// Centralized error class hierarchy cho toàn bộ application.
//
// Tại sao cần error classes riêng?
//   - Phân biệt rõ loại lỗi để xử lý đúng cách (404 vs 500 vs validation)
//   - API routes trả đúng HTTP status code
//   - Error boundaries hiển thị đúng UI (not-found vs server-error vs auth)
//   - Logger có context đầy đủ (type, code, metadata)

// ── Base Application Error ────────────────────────────────────────────────────

export class AppError extends Error {
  /**
   * @param {string} message    - Human-readable message (tiếng Việt cho user)
   * @param {number} statusCode - HTTP status code tương ứng
   * @param {string} code       - Machine-readable error code (cho logging/i18n)
   * @param {object} [meta]     - Extra context (field names, resource id...)
   */
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR", meta = {}) {
    super(message)
    this.name        = this.constructor.name
    this.statusCode  = statusCode
    this.code        = code
    this.meta        = meta
    this.isOperational = true  // Phân biệt lỗi có thể xử lý vs lỗi lập trình
    // Capture stack trace (Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

// ── Specific Error Types ──────────────────────────────────────────────────────

/**
 * 404 — Resource không tìm thấy
 * @example throw new NotFoundError("Bài viết")  → "Bài viết không tồn tại"
 */
export class NotFoundError extends AppError {
  constructor(resource = "Trang", meta = {}) {
    super(`${resource} không tồn tại hoặc đã bị xóa.`, 404, "NOT_FOUND", meta)
  }
}

/**
 * 422 — Validation thất bại (dữ liệu form/API không hợp lệ)
 * @example throw new ValidationError("Email không hợp lệ", { field: "email" })
 */
export class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, 422, "VALIDATION_ERROR", { fields })
    this.fields = fields
  }
}

/**
 * 401 — Chưa đăng nhập
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Bạn cần đăng nhập để thực hiện thao tác này.") {
    super(message, 401, "UNAUTHORIZED")
  }
}

/**
 * 403 — Đã đăng nhập nhưng không có quyền
 */
export class ForbiddenError extends AppError {
  constructor(message = "Bạn không có quyền thực hiện thao tác này.") {
    super(message, 403, "FORBIDDEN")
  }
}

/**
 * 409 — Conflict (duplicate record, deadline passed...)
 * @example throw new ConflictError("Email này đã đăng ký sự kiện trước đó.")
 */
export class ConflictError extends AppError {
  constructor(message, meta = {}) {
    super(message, 409, "CONFLICT", meta)
  }
}

/**
 * 429 — Rate limit exceeded
 */
export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super("Quá nhiều yêu cầu. Vui lòng thử lại sau.", 429, "RATE_LIMIT", { retryAfter })
    this.retryAfter = retryAfter
  }
}

/**
 * 503 — Database/external service không khả dụng
 */
export class ServiceUnavailableError extends AppError {
  constructor(service = "Database") {
    super(`${service} hiện không khả dụng. Vui lòng thử lại sau.`, 503, "SERVICE_UNAVAILABLE", { service })
  }
}

// ── API Route Error Handler ───────────────────────────────────────────────────

/**
 * Chuyển đổi bất kỳ error nào thành NextResponse JSON chuẩn.
 * Dùng trong tất cả API route handlers.
 *
 * @param {unknown} error
 * @param {string}  [context] - Tên route để log (vd: "POST /api/contact")
 * @returns {Response}
 *
 * @example
 * export async function POST(req) {
 *   try { ... }
 *   catch (err) { return handleApiError(err, "POST /api/contact") }
 * }
 */
export function handleApiError(error, context = "API") {
  const { NextResponse } = require("next/server")

  // Lỗi có thể xử lý (operational errors)
  if (error instanceof AppError) {
    // Chỉ log 5xx errors — 4xx là lỗi của client, không phải server
    if (error.statusCode >= 500) {
      logger.error(`[${context}] ${error.code}`, error, error.meta)
    }

    const body = {
      error:  error.message,
      code:   error.code,
    }

    // Thêm field errors cho validation
    if (error instanceof ValidationError) {
      body.fields = error.fields
    }

    // Thêm retry header cho rate limit
    const headers = {}
    if (error instanceof RateLimitError) {
      headers["Retry-After"] = String(error.retryAfter)
    }

    return NextResponse.json(body, { status: error.statusCode, headers })
  }

  // Lỗi không mong đợi (programming errors, DB crashes...)
  logger.error(`[${context}] Unexpected error`, error)

  return NextResponse.json(
    { error: "Đã xảy ra lỗi. Vui lòng thử lại sau.", code: "INTERNAL_ERROR" },
    { status: 500 }
  )
}

// ── Lazy import logger để tránh circular dependency ──────────────────────────
// (logger import errors.js, errors.js không nên import logger trực tiếp)
let _logger = null
const logger = {
  error: (...args) => {
    if (!_logger) _logger = require("./logger").logger
    _logger.error(...args)
  }
}