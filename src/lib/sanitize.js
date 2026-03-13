// src/lib/sanitize.js
//
// ✅ FIX Critical #3 — Server-side HTML sanitizer để ngăn XSS
//
// Chiến lược: Allowlist-based sanitization
// - Chỉ cho phép các thẻ HTML an toàn (không có script, iframe, object...)
// - Chỉ cho phép các attribute an toàn (không có onclick, onerror, javascript:...)
// - Chạy hoàn toàn server-side (trong Server Component), không cần bundle client
//
// Tại sao không dùng DOMPurify?
//   DOMPurify cần DOM API → chỉ chạy được trên client hoặc cần jsdom (nặng).
//   Với Next.js Server Components, server-side regex sanitizer này đủ dùng
//   và không tăng bundle size.
//
// Nếu content phức tạp hơn (user-generated HTML với nhiều edge cases),
// hãy dùng: npm install isomorphic-dompurify  (hỗ trợ cả server và client)

// ── Danh sách thẻ được phép ──────────────────────────────────────────────────

const ALLOWED_TAGS = new Set([
  // Text formatting
  "p", "br", "hr",
  "strong", "b", "em", "i", "u", "s", "del", "ins",
  "mark", "small", "sub", "sup",
  // Headings
  "h1", "h2", "h3", "h4", "h5", "h6",
  // Lists
  "ul", "ol", "li", "dl", "dt", "dd",
  // Links & media
  "a", "img",
  // Blocks
  "div", "span", "section", "article", "aside",
  "header", "footer", "main", "nav",
  "blockquote", "pre", "code",
  // Tables
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  // Misc
  "figure", "figcaption",
])

// ── Danh sách attribute được phép theo từng thẻ ──────────────────────────────

const ALLOWED_ATTRS = {
  // Global attrs an toàn
  _global: new Set(["class", "id", "title", "lang", "dir"]),
  // Link: chỉ cho href an toàn (không cho javascript:)
  a:   new Set(["href", "target", "rel", "class", "id", "title"]),
  // Image: phải có alt
  img: new Set(["src", "alt", "width", "height", "class", "id", "title", "loading"]),
  // Table
  th:  new Set(["colspan", "rowspan", "scope", "class"]),
  td:  new Set(["colspan", "rowspan", "class"]),
  // Block level
  blockquote: new Set(["cite", "class"]),
}

// ── Patterns nguy hiểm cần chặn ──────────────────────────────────────────────

// Event handlers: onclick, onmouseover, onerror, onload, ...
const DANGEROUS_ATTR_PATTERN = /^on[a-z]+/i

// URL nguy hiểm: javascript:, data:text/html, vbscript:
const DANGEROUS_URL_PATTERN = /^\s*(javascript:|data\s*:|vbscript:)/i

// ── Core sanitizer ────────────────────────────────────────────────────────────

/**
 * Sanitize HTML string để ngăn XSS.
 * Dùng trong Server Components trước khi render dangerouslySetInnerHTML.
 *
 * @param {string} html - Raw HTML từ database
 * @returns {string} - HTML đã được sanitize
 *
 * @example
 * import { sanitizeHtml } from "@/lib/sanitize"
 * <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== "string") return ""

  // Bước 1: Loại bỏ toàn bộ script tags và nội dung bên trong
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Loại bỏ HTML comments (có thể chứa IE conditional comments)
    .replace(/<!--[\s\S]*?-->/g, "")
    // Loại bỏ các thẻ nguy hiểm hoàn toàn (kể cả nội dung bên trong)
    .replace(/<(iframe|frame|frameset|object|embed|applet|base|form|input|button|select|textarea|link|meta)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(iframe|frame|frameset|object|embed|applet|base|form|input|button|select|textarea|link|meta)\b[^>]*\/?>/gi, "")

  // Bước 2: Parse và filter từng tag còn lại
  clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, tagName, attrsStr) => {
    const tag = tagName.toLowerCase()

    // Thẻ không trong allowlist → xóa hoàn toàn
    if (!ALLOWED_TAGS.has(tag)) return ""

    // Closing tag không có attribute → giữ nguyên
    if (match.startsWith("</")) return `</${tag}>`

    // Parse và filter attributes
    const safeAttrs = sanitizeAttrs(tag, attrsStr)
    const selfClosing = match.endsWith("/>") || tag === "br" || tag === "hr" || tag === "img"

    return selfClosing ? `<${tag}${safeAttrs} />` : `<${tag}${safeAttrs}>`
  })

  return clean
}

/**
 * Sanitize attributes của một thẻ HTML.
 * @param {string} tag - Tên thẻ (lowercase)
 * @param {string} attrsStr - Chuỗi attributes raw
 * @returns {string} - Attributes đã được sanitize, bắt đầu bằng space nếu có
 */
function sanitizeAttrs(tag, attrsStr) {
  if (!attrsStr?.trim()) return ""

  // Allowed attrs cho thẻ này (union của tag-specific và global)
  const tagAllowed   = ALLOWED_ATTRS[tag]   ?? new Set()
  const globalAllowed = ALLOWED_ATTRS._global ?? new Set()

  const result = []

  // Parse từng attribute bằng regex
  // Hỗ trợ: attr="value", attr='value', attr=value, attr (boolean)
  const attrPattern = /([a-zA-Z][a-zA-Z0-9\-:]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g
  let m

  while ((m = attrPattern.exec(attrsStr)) !== null) {
    const [, name, dq, sq, uq] = m
    const attrName  = name.toLowerCase()
    const attrValue = dq ?? sq ?? uq ?? ""

    // Block event handlers (onclick, onerror, ...)
    if (DANGEROUS_ATTR_PATTERN.test(attrName)) continue

    // Kiểm tra attr có trong allowlist không
    if (!tagAllowed.has(attrName) && !globalAllowed.has(attrName)) continue

    // Validate URL attributes
    if ((attrName === "href" || attrName === "src") && DANGEROUS_URL_PATTERN.test(attrValue)) {
      continue
    }

    // Với link target="_blank" → bắt buộc thêm rel="noopener noreferrer" để bảo mật
    if (tag === "a" && attrName === "target" && attrValue === "_blank") {
      result.push(`target="_blank"`)
      result.push(`rel="noopener noreferrer"`)
      continue
    }

    // Skip rel nếu đã được add ở trên
    if (tag === "a" && attrName === "rel") {
      // Sẽ được add cùng target="_blank" ở trên
      // Nếu không có target="_blank" thì vẫn cho phép rel
      if (!attrsStr.includes('target="_blank"') && !attrsStr.includes("target='_blank'")) {
        result.push(`rel="${escapeAttr(attrValue)}"`)
      }
      continue
    }

    // Encode attribute value để ngăn attribute injection
    result.push(`${attrName}="${escapeAttr(attrValue)}"`)
  }

  return result.length > 0 ? " " + result.join(" ") : ""
}

/**
 * Escape special characters trong attribute value.
 */
function escapeAttr(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * Sanitize plain text (escape tất cả HTML entities).
 * Dùng khi cần render text thuần, không có HTML.
 *
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  if (!text || typeof text !== "string") return ""
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}