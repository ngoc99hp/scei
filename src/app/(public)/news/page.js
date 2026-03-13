// src/app/(public)/news/page.js
import Link from "next/link"
import Image from "next/image"
import { getArticles, getArticleCount } from "@/lib/queries/articles"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { buildPagination, parsePage } from "@/lib/pagination"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PaginationControls } from "@/components/ui/pagination"
import { ArrowRight, CalendarDays, Eye } from "lucide-react"

export const revalidate = 1800

export const metadata = {
  title: "Tin tức & Kiến thức — SCEI",
  description: "Cập nhật tin tức khởi nghiệp, bài viết kiến thức và câu chuyện thành công từ hệ sinh thái SCEI.",
}

const CATEGORIES = [
  { value: "",           label: "Tất cả" },
  { value: "tin-tuc",    label: "Tin tức" },
  { value: "kien-thuc",  label: "Kiến thức" },
  { value: "startup",    label: "Startup" },
  { value: "su-kien",    label: "Sự kiện" },
]

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" }) : ""

export default async function NewsPage({ searchParams }) {
  const sp       = await searchParams
  const page     = parsePage(sp?.page)
  const category = sp?.category ?? ""

  const [articles, total] = await Promise.all([
    getArticles({ limit: DEFAULT_PAGE_SIZE, offset: (page - 1) * DEFAULT_PAGE_SIZE, category: category || undefined }),
    getArticleCount({ category: category || undefined }),
  ])

  const pager    = buildPagination(total, page, DEFAULT_PAGE_SIZE)
  const featured = page === 1 && !category ? articles[0] : null
  const rest     = page === 1 && !category ? articles.slice(1) : articles

  return (
    <>
      {/* Hero */}
      <div className="bg-linear-to-br from-gray-900 to-gray-700 text-white py-16">
        <Container>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-3">Tin tức & Kiến thức</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cập nhật từ SCEI</h1>
          <p className="text-gray-300 text-lg max-w-xl">
            Tin tức khởi nghiệp, bài học thực tiễn và câu chuyện từ hệ sinh thái đổi mới sáng tạo.
          </p>
        </Container>
      </div>

      <Section className="py-12">
        <Container>
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map(cat => {
              const isActive = category === cat.value
              return (
                <Link
                  key={cat.value}
                  href={cat.value ? `/news?category=${cat.value}` : "/news"}
                  className={[
                    "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
                    isActive
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400",
                  ].join(" ")}
                >
                  {cat.label}
                </Link>
              )
            })}
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📰</p>
              <p className="font-medium">Chưa có bài viết nào.</p>
            </div>
          ) : (
            <>
              {/* Featured article (trang 1, không filter) */}
              {featured && (
                <Link href={`/news/${featured.slug}`} className="group block mb-12">
                  <div className="grid md:grid-cols-2 gap-8 rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all bg-white">
                    {featured.cover_image && (
                      <div className="relative h-64 md:h-full min-h-[240px]">
                        <Image
                          src={featured.cover_image}
                          alt={featured.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      </div>
                    )}
                    <div className="p-8 flex flex-col justify-center">
                      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
                        {featured.category}
                      </span>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-3">
                        {featured.title}
                      </h2>
                      <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {fmtDate(featured.published_at)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />
                          {featured.view_count?.toLocaleString("vi-VN") ?? 0} lượt xem
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Article grid */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map(article => (
                  <Link key={article.id} href={`/news/${article.slug}`} className="group">
                    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                      {article.cover_image && (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={article.cover_image}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2 block">
                          {article.category}
                        </span>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {fmtDate(article.published_at)}
                          </span>
                          <span className="flex items-center gap-1 text-blue-600 font-medium group-hover:gap-2 transition-all">
                            Đọc thêm <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pager.pages > 1 && (
                <div className="mt-12">
                  <PaginationControls
                    pager={pager}
                    basePath="/news"
                    searchParams={category ? { category } : {}}
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