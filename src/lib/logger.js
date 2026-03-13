// src/lib/logger.js
// Structured logger cho production observability.
//
// Tại sao cần structured logging?
//   - console.log("Error:", err) → không thể search, filter, alert
//   - JSON logs → có thể ingest vào Vercel Logs, Datadog, Grafana Loki...
//   - Mỗi log entry có timestamp, level, context → dễ debug production issues
//
// Trong development: output màu dễ đọc
// Trong production:  output JSON để log aggregator parse

const IS_PROD = process.env.NODE_ENV === "production"
const IS_TEST = process.env.NODE_ENV === "test"

// Log levels theo thứ tự nghiêm trọng
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 }

// Minimum level để output (có thể override qua env)
const MIN_LEVEL = IS_TEST
  ? LEVELS.error                                              // Im lặng khi test
  : LEVELS[process.env.LOG_LEVEL ?? (IS_PROD ? "info" : "debug")]

// ── Core log function ─────────────────────────────────────────────────────────

function log(level, message, errorOrMeta, meta = {}) {
  if (LEVELS[level] < MIN_LEVEL) return

  // Phân biệt argument thứ 3 là Error hay plain object
  let err = null
  let extraMeta = meta

  if (errorOrMeta instanceof Error) {
    err = errorOrMeta
  } else if (errorOrMeta && typeof errorOrMeta === "object") {
    extraMeta = { ...errorOrMeta, ...meta }
  }

  const entry = {
    ts:      new Date().toISOString(),
    level,
    message,
    ...extraMeta,
  }

  // Thêm error details nếu có
  if (err) {
    entry.error = {
      name:       err.name,
      message:    err.message,
      code:       err.code,       // AppError.code nếu có
      statusCode: err.statusCode, // AppError.statusCode nếu có
      stack:      IS_PROD ? undefined : err.stack, // Stack chỉ ở dev
    }
  }

  if (IS_PROD) {
    // Production: JSON một dòng → log aggregator parse được
    const output = JSON.stringify(entry)
    if (level === "error" || level === "warn") {
      process.stderr.write(output + "\n")
    } else {
      process.stdout.write(output + "\n")
    }
  } else {
    // Development: màu dễ đọc
    const colors = {
      debug: "\x1b[37m",   // white
      info:  "\x1b[36m",   // cyan
      warn:  "\x1b[33m",   // yellow
      error: "\x1b[31m",   // red
    }
    const reset = "\x1b[0m"
    const color = colors[level] ?? reset

    const prefix = `${color}[${level.toUpperCase()}]${reset} ${entry.ts.slice(11, 19)}`
    const metaStr = Object.keys(extraMeta).length > 0
      ? " " + JSON.stringify(extraMeta)
      : ""

    if (level === "error" || level === "warn") {
      process.stderr.write(`${prefix} ${message}${metaStr}\n`)
      if (err?.stack) process.stderr.write(`${color}${err.stack}${reset}\n`)
    } else {
      process.stdout.write(`${prefix} ${message}${metaStr}\n`)
    }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export const logger = {
  /**
   * Thông tin debug (chỉ development)
   * @param {string} message
   * @param {object} [meta]
   */
  debug: (message, meta) => log("debug", message, meta),

  /**
   * Thông tin thông thường (request đến, action thành công)
   * @param {string} message
   * @param {object} [meta]
   */
  info: (message, meta) => log("info", message, meta),

  /**
   * Cảnh báo (không crash nhưng cần chú ý)
   * @param {string} message
   * @param {Error|object} [errorOrMeta]
   * @param {object} [meta]
   */
  warn: (message, errorOrMeta, meta) => log("warn", message, errorOrMeta, meta),

  /**
   * Lỗi nghiêm trọng (cần alert/investigate)
   * @param {string} message
   * @param {Error|object} [errorOrMeta]
   * @param {object} [meta]
   */
  error: (message, errorOrMeta, meta) => log("error", message, errorOrMeta, meta),

  /**
   * Log HTTP request (dùng trong API routes)
   * @param {string} method
   * @param {string} path
   * @param {number} status
   * @param {number} durationMs
   */
  request: (method, path, status, durationMs) => log(
    status >= 500 ? "error" : status >= 400 ? "warn" : "info",
    `${method} ${path} ${status}`,
    { duration_ms: durationMs, status }
  ),
}

export default logger