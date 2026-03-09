// src/app/(public)/resources/page.js
import Link from "next/link"
import Image from "next/image"
import { getResources, getResourceCount } from "@/lib/queries/resources"
import { RESOURCE_TYPE_LABEL, DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { buildPagination, parsePage } from "@/lib/pagination"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { PaginationControls } from "@/components/ui/pagination"
import { Download, ArrowRight, ExternalLink } from "lucide-react"

export const revalidate = 3600

export const metadata = {
  title: "Tài nguyên — SCEI",
  description: "Kho tài liệu, template, ebook và công cụ hỗ trợ khởi nghiệp miễn phí từ SCEI.",
}

const RESOURCE_TYPES = [
  { value: "",         label: "Tất cả" },
  { value: "DOCUMENT", label: "Tài liệu" },
  { value: "VIDEO",    label: "Video" },
  { value: "TEMPLATE", label: "Template" },
  { value: "TOOL",     label: "Công cụ" },
  { value: "EBOOK",    label: "Ebook" },
]

export default async function ResourcesPage({ searchParams }) {
  const sp       = await searchParams
  const page     = parsePage(sp?.page)
  const category = sp?.type ?? ""

  const [resources, total] = await Promise.all([
    getResources({ page, pageSize: DEFAULT_PAGE_SIZE, category: category || undefined }),
    getResourceCount({ category: category || undefined }),
  ])

  const pager = buildPagination(total, page, DEFAULT_PAGE_SIZE)

  return (
    <>
      {/* Hero */}
      <div className="bg-linear-to-br from-emerald-600 to-teal-700 text-white py-16">
        <Container>
          <p className="text-emerald-200 text-sm font-medium uppercase tracking-widest mb-3">Tài nguyên</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kho tài nguyên khởi nghiệp</h1>
          <p className="text-emerald-100 text-lg max-w-xl">
            Tài liệu, template, ebook và công cụ được tuyển chọn kỹ để hỗ trợ hành trình khởi nghiệp của bạn.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm">
            <Download className="w-4 h-4" />
            <span><strong>{total}</strong> tài nguyên miễn phí</span>
          </div>
        </Container>
      </div>

      <Section className="py-12">
        <Container>
          {/* Type filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {RESOURCE_TYPES.map(t => {
              const isActive = category === t.value
              const info = t.value ? RESOURCE_TYPE_LABEL[t.value] : null
              return (
                <Link
                  key={t.value}
                  href={t.value ? `/resources?type=${t.value}` : "/resources"}
                  className={[
                    "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400",
                  ].join(" ")}
                >
                  {info?.icon && <span className="mr-1.5">{info.icon}</span>}
                  {t.label}
                </Link>
              )
            })}
          </div>

          {resources.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📦</p>
              <p className="font-medium">Chưa có tài nguyên nào.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {resources.map(res => {
                  const typeInfo = RESOURCE_TYPE_LABEL[res.type] ?? { label: res.type, icon: "📄", color: "" }
                  const href = res.external_url || res.file_url
                  return (
                    <Link
                      key={res.id}
                      href={href ? `/resources/${res.slug}` : `/resources/${res.slug}`}
                      className="group"
                    >
                      <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                        {res.cover_image ? (
                          <div className="relative h-40 overflow-hidden">
                            <Image
                              src={res.cover_image}
                              alt={res.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          </div>
                        ) : (
                          <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                            <span className="text-5xl">{typeInfo.icon}</span>
                          </div>
                        )}

                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeInfo.color}`}>
                              {typeInfo.icon} {typeInfo.label}
                            </span>
                            {res.is_featured && (
                              <span className="rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 text-xs font-semibold">
                                ⭐ Nổi bật
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors flex-1">
                            {res.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{res.description}</p>

                          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
                            <span className="flex items-center gap-1">
                              <Download className="w-3.5 h-3.5" />
                              {res.download_count?.toLocaleString("vi-VN") ?? 0}
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600 font-medium group-hover:gap-2 transition-all">
                              {res.external_url ? (
                                <><ExternalLink className="w-3.5 h-3.5" /> Xem ngay</>
                              ) : (
                                <><Download className="w-3.5 h-3.5" /> Tải xuống</>
                              )}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>

              {pager.pages > 1 && (
                <div className="mt-12">
                  <PaginationControls
                    pager={pager}
                    basePath="/resources"
                    searchParams={category ? { type: category } : {}}
                  />
                </div>
              )}
            </>
          )}
        </Container>
      </Section>
    </>
  )
}