// src/app/(public)/events/loading.js
// Hiển thị khi DB query đang chạy — thay thế màn hình trắng.
// Next.js tự động render file này trong Suspense boundary.

import { ListPageSkeleton } from "@/components/ui/skeleton"

export default function EventsLoading() {
  return <ListPageSkeleton count={6} />
}
