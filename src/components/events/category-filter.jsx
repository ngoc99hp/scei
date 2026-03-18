"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import { EVENT_TYPE_LABEL } from "@/lib/constants"
import { Filter } from "lucide-react"

export function CategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentType = searchParams.get("type") ?? "all"

  const types = [
    { key: "all", label: "Tất cả" },
    { key: "WORKSHOP", label: "Workshop" },
    { key: "PITCHING", label: "Pitching" },
    { key: "NETWORKING", label: "Networking" },
    { key: "SEMINAR", label: "Seminar" },
    { key: "CONFERENCE", label: "Conference" },
    { key: "OTHER", label: "Khác" },
  ]

  const handleTypeChange = (key) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === "all") {
      params.delete("type")
    } else {
      params.set("type", key)
    }
    params.set("page", "1")
    router.push(`/events?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {types.map((t) => (
        <Button
          key={t.key}
          variant={currentType === t.key ? "primary" : "outline"}
          className={`rounded-lg px-6 h-10 font-medium transition-all duration-300 ${
            currentType === t.key 
              ? "bg-primary text-white shadow-md hover:bg-primary/90" 
              : "bg-white hover:bg-primary/10 hover:text-primary text-muted-foreground border-border"
          }`}
          onClick={() => handleTypeChange(t.key)}
        >
          {t.label}
        </Button>
      ))}
    </div>
  )
}
