// src/app/(public)/resources/loading.js
import { ListPageSkeleton } from "@/components/ui/skeleton"

export default function ResourcesLoading() {
  return <ListPageSkeleton count={6} />
}
