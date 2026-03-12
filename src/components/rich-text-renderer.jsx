// src/components/rich-text-renderer.jsx
// Server Component — render HTML content từ Tiptap editor
// Dùng trong: events/[slug], programs/[slug]
// Không phải client component vì chỉ render HTML tĩnh

import { sanitizeHtml } from "@/lib/sanitize"

export default function RichTextRenderer({ html, className = "" }) {
  if (!html) return null

  const safe = sanitizeHtml(html)

  return (
    <div
      className={`
        prose prose-gray max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
        prose-p:text-gray-600 prose-p:leading-relaxed
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-800 prose-strong:font-semibold
        prose-ul:pl-6 prose-ol:pl-6
        prose-li:text-gray-600 prose-li:leading-relaxed
        prose-blockquote:border-l-4 prose-blockquote:border-primary/40
        prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-500
        prose-hr:border-gray-200
        prose-code:bg-gray-100 prose-code:rounded prose-code:px-1 prose-code:text-sm
        ${className}
      `}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}