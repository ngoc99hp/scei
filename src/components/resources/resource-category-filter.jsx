"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { RESOURCE_TYPE_LABEL } from "@/lib/constants"

export function ResourceCategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentType = searchParams.get("type") ?? "all"

  const types = [
    { value: "all", label: "Tất cả" },
    { value: "DOCUMENT", label: "Tài liệu" },
    { value: "VIDEO",    label: "Video" },
    { value: "TEMPLATE", label: "Template" },
    { value: "TOOL",     label: "Công cụ" },
    { value: "EBOOK",    label: "Ebook" },
  ]

  const handleTypeChange = (value) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("type")
    } else {
      params.set("type", value)
    }
    params.set("page", "1")
    router.push(`/resources?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-2 mb-10">
      {types.map((t) => {
        const isActive = currentType === t.value
        const info = t.value !== "all" ? RESOURCE_TYPE_LABEL[t.value] : null
        
        return (
          <button
            key={t.value}
            onClick={() => handleTypeChange(t.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors cursor-pointer ${
              isActive
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {info?.icon && <span className="mr-1.5">{info.icon}</span>}
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
