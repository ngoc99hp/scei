// src/app/(public)/mentors/loading.js
import { ListPageSkeleton } from "@/components/ui/skeleton"

export default function MentorsLoading() {
  return <ListPageSkeleton count={6} cols="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
}
