"use client"

import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, useTransition } from "react"
import { useDebounce } from "@/hooks/use-debounce"

export function EventSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const initialQuery = searchParams.get("q") ?? ""
  const [value, setValue] = useState(initialQuery)
  const debouncedValue = useDebounce(value, 500)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (debouncedValue) {
      params.set("q", debouncedValue)
    } else {
      params.delete("q")
    }
    params.set("page", "1") // Reset to page 1 on search

    startTransition(() => {
      router.push(`/events?${params.toString()}`, { scroll: false })
    })
  }, [debouncedValue, router, searchParams])

  return (
    <div className="flex-1 flex items-center">
      <input
        type="text"
        placeholder="Tìm kiếm sự kiện..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
      />
      {isPending && (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent ml-2" />
      )}
    </div>
  )
}
