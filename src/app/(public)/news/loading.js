// src/app/(public)/news/loading.js
import { ListPageSkeleton } from "@/components/ui/skeleton"

export default function NewsLoading() {
  return <ListPageSkeleton count={6} />
}
