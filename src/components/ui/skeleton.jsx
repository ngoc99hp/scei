// src/components/ui/skeleton.jsx
// Skeleton loading components — tái sử dụng trong tất cả loading.js files.
// Mỗi variant khớp với layout thực của page tương ứng để tránh CLS.

// ── Primitive ─────────────────────────────────────────────────────────────────

export function Skeleton({ className = "", style }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

// ── Card Skeletons ────────────────────────────────────────────────────────────

/** Skeleton cho event/news card dạng grid */
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

/** Grid của N card skeletons */
export function CardGridSkeleton({ count = 6, cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`grid ${cols} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

/** Skeleton cho card dạng list (events list view) */
export function ListCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-100 bg-white p-4">
      <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

// ── Detail Page Skeletons ─────────────────────────────────────────────────────

/** Skeleton cho article/event/program detail page */
export function DetailPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Back link */}
      <Skeleton className="h-4 w-28" />

      {/* Cover image */}
      <Skeleton className="h-64 md:h-96 w-full rounded-2xl" />

      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-8 space-y-4">
        {/* Body paragraphs */}
        {[100, 95, 88, 100, 72, 90, 83, 60].map((w, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
        ))}
        <div className="pt-2 space-y-4">
          {[100, 93, 85, 78].map((w, i) => (
            <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Skeleton cho program detail (có sidebar đăng ký) */
export function ProgramDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-60 w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-8 w-3/4" />
          </div>
          <div className="space-y-3 pt-4">
            {[100, 92, 88, 95, 70, 85].map((w, i) => (
              <Skeleton key={i} className="h-4" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        {/* Sidebar */}
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-full" />
          <div className="space-y-2">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page-level Skeletons ──────────────────────────────────────────────────────

/** Skeleton cho trang list có filter bar + grid */
export function ListPageSkeleton({ count = 6 }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      {/* Page header */}
      <div className="space-y-3 text-center">
        <Skeleton className="h-9 w-64 mx-auto" />
        <Skeleton className="h-4 w-96 max-w-full mx-auto" />
      </div>
      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap justify-center">
        {[80, 100, 90, 110, 75].map((w, i) => (
          <Skeleton key={i} className="h-8 rounded-full" style={{ width: `${w}px` }} />
        ))}
      </div>
      {/* Grid */}
      <CardGridSkeleton count={count} />
      {/* Pagination */}
      <div className="flex justify-center gap-2 pt-4">
        {[1,2,3,4,5].map(i => (
          <Skeleton key={i} className="h-9 w-9 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

/** Skeleton cho trang startups (có search + table/grid) */
export function StartupsPageSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3 text-center">
        <Skeleton className="h-9 w-72 mx-auto" />
        <Skeleton className="h-4 w-80 max-w-full mx-auto" />
      </div>
      {/* Search */}
      <Skeleton className="h-12 max-w-md w-full mx-auto rounded-full" />
      {/* Grid */}
      <CardGridSkeleton count={9} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
    </div>
  )
}

/** Skeleton cho contact page */
export function ContactPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <Skeleton className="h-9 w-40 mx-auto" />
        <Skeleton className="h-4 w-72 max-w-full mx-auto" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  )
}

/** Skeleton cho admin dashboard */
export function AdminDashboardSkeleton() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}