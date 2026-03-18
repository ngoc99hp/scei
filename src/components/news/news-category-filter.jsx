"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export function NewsCategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") ?? "all"

  const categories = [
    { key: "all", label: "Tất cả" },
    { key: "tin-tuc", label: "Tin tức" },
    { key: "kien-thuc", label: "Kiến thức" },
    { key: "startup", label: "Startup" },
    { key: "su-kien", label: "Sự kiện" },
  ]

  const handleCategoryChange = (key) => {
    const params = new URLSearchParams(searchParams.toString())
    if (key === "all") {
      params.delete("category")
    } else {
      params.set("category", key)
    }
    params.set("page", "1")
    router.push(`/news?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-2 mb-10">
      {categories.map((cat) => (
        <Button
          key={cat.key}
          variant={currentCategory === cat.key ? "primary" : "outline"}
          onClick={() => handleCategoryChange(cat.key)}
          className={`rounded-lg px-6 h-10 font-medium transition-all duration-300 ${
            currentCategory === cat.key 
              ? "bg-primary text-white shadow-md hover:bg-primary/90" 
              : "bg-white border-border text-muted-foreground hover:bg-primary/10 hover:text-primary"
          }`}
        >
          {cat.label}
        </Button>
      ))}
    </div>
  )
}
