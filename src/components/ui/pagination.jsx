// src/components/ui/pagination.jsx
// URL-based pagination — tương thích Next.js App Router Server Components

import Link from "next/link"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

/**
 * @param {{ pager: import("@/lib/pagination").PaginationMeta, basePath: string, searchParams?: Record<string,string> }} props
 */
export function PaginationControls({ pager, basePath, searchParams = {} }) {
  const { page, pages, hasPrev, hasNext } = pager

  if (pages <= 1) return null

  function href(p) {
    const qs = new URLSearchParams({ ...searchParams, page: String(p) }).toString()
    return `${basePath}?${qs}`
  }

  // Tạo dãy số trang hiển thị với "..." truncation
  function getPageNumbers() {
    const delta  = 2
    const left   = Math.max(2, page - delta)
    const right  = Math.min(pages - 1, page + delta)
    const nums   = [1]

    if (left > 2)     nums.push("...")
    for (let i = left; i <= right; i++) nums.push(i)
    if (right < pages - 1) nums.push("...")
    if (pages > 1)    nums.push(pages)

    return nums
  }

  const pageNums = getPageNumbers()

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      {/* Prev */}
      {hasPrev ? (
        <Link
          href={href(page - 1)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border text-muted-foreground opacity-40 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {/* Page numbers */}
      {pageNums.map((n, i) =>
        n === "..." ? (
          <span key={`dots-${i}`} className="inline-flex items-center justify-center h-9 w-9 text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === page ? "page" : undefined}
            className={`inline-flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors
              ${n === page
                ? "bg-primary text-primary-foreground pointer-events-none"
                : "border border-border hover:bg-accent"
              }`}
          >
            {n}
          </Link>
        )
      )}

      {/* Next */}
      {hasNext ? (
        <Link
          href={href(page + 1)}
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border text-sm hover:bg-accent transition-colors"
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border text-muted-foreground opacity-40 cursor-not-allowed">
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  )
}