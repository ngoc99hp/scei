// src/app/(public)/resources/[slug]/page.js
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getResourceBySlug, getRelatedResources } from "@/lib/queries/resources"
import { RESOURCE_TYPE_LABEL } from "@/lib/constants"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Download, ExternalLink, Tag } from "lucide-react"

export const revalidate = 3600

export async function generateMetadata({ params }) {
  const { slug } = await params
  const resource = await getResourceBySlug(slug)
  if (!resource) return {}
  return {
    title: `${resource.title} — SCEI`,
    description: resource.description,
  }
}

export default async function ResourceDetailPage({ params }) {
  const { slug } = await params
  const resource = await getResourceBySlug(slug)
  if (!resource) notFound()

  const related  = await getRelatedResources(resource.id, resource.category, 4)
  const typeInfo = RESOURCE_TYPE_LABEL[resource.type] ?? { label: resource.type, icon: "📄", color: "" }
  const downloadHref = resource.file_url || resource.external_url

  return (
    <>
      <Section className="py-12">
        <Container>
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại tài nguyên
          </Link>

          <div className="grid gap-10 lg:grid-cols-3">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {resource.cover_image && (
                <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden">
                  <Image
                    src={resource.cover_image}
                    alt={resource.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${typeInfo.color}`}>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                  {resource.is_featured && (
                    <span className="rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1 text-sm font-semibold">
                      ⭐ Nổi bật
                    </span>
                  )}
                  <span className="text-sm text-gray-400 ml-auto">
                    <Download className="inline w-4 h-4 mr-1" />
                    {resource.download_count?.toLocaleString("vi-VN") ?? 0} lượt tải
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{resource.title}</h1>
                <p className="text-lg text-gray-500 leading-relaxed">{resource.description}</p>
              </div>

              {resource.tags?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {resource.tags.map(tag => (
                    <span key={tag} className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar: CTA */}
            <div className="space-y-5">
              <Card className="p-6 sticky top-24">
                <h3 className="font-bold text-gray-900 mb-2">Tải tài nguyên</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Tài nguyên này hoàn toàn <strong className="text-gray-700">miễn phí</strong>, không yêu cầu đăng ký tài khoản.
                </p>

                {downloadHref ? (
                  <a
                    href={downloadHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-5 transition-colors"
                  >
                    {resource.external_url ? (
                      <><ExternalLink className="w-4 h-4" /> Xem ngay</>
                    ) : (
                      <><Download className="w-4 h-4" /> Tải xuống</>
                    )}
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full rounded-xl bg-gray-200 text-gray-400 font-semibold py-3 px-5 cursor-not-allowed"
                  >
                    Chưa có link tải
                  </button>
                )}

                <p className="text-xs text-gray-400 text-center mt-3">
                  Danh mục: <span className="font-medium text-gray-600">{resource.category}</span>
                </p>
              </Card>

              {/* Related */}
              {related.length > 0 && (
                <Card className="p-5">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Tài nguyên liên quan</h3>
                  <ul className="space-y-3">
                    {related.map(r => {
                      const rType = RESOURCE_TYPE_LABEL[r.type] ?? { icon: "📄" }
                      return (
                        <li key={r.id}>
                          <Link
                            href={`/resources/${r.slug}`}
                            className="group flex items-start gap-3 hover:text-emerald-600 transition-colors"
                          >
                            <span className="text-2xl flex-shrink-0">{rType.icon}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                {r.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                {r.download_count?.toLocaleString("vi-VN") ?? 0} lượt tải
                              </p>
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </Card>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}