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

import { NewsCategoryFilter } from "@/components/news/news-category-filter"

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" }) : ""

export default async function NewsPage({ searchParams }) {
  const sp       = await searchParams
  const page     = parsePage(sp?.page)
  const category = sp?.category ?? "all"

  // Fetch featured independently on page 1 if no category, or handle accordingly
  // For consistency with events, we fetch the MOST RECENT article as featured if on page 1
  const [articles, total, featuredList] = await Promise.all([
    getArticles({ 
      limit: DEFAULT_PAGE_SIZE, 
      offset: (page - 1) * DEFAULT_PAGE_SIZE, 
      category: category 
    }),
    getArticleCount({ category: category }),
    page === 1 ? getArticles({ limit: 1 }) : Promise.resolve([]),
  ])

  const pager    = buildPagination(total, page, DEFAULT_PAGE_SIZE)
  const featured = page === 1 ? featuredList[0] : null
  const filteredArticles = articles.filter(a => a.id !== featured?.id)

  return (
    <>
      {/* Hero */}
      <Section className="relative bg-muted/30 py-16 overflow-hidden border-b border-border text-center md:text-left">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop"
            alt="News Background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto md:mx-0">
            <span className="text-white/60 text-sm font-bold uppercase tracking-widest mb-3 block">Tin tức & Kiến thức</span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">Cập nhật từ <span className="text-primary italic">SCEI</span></h1>
            <p className="text-white/80 text-lg max-w-xl mx-auto md:mx-0">
              Tin tức khởi nghiệp, bài học thực tiễn và câu chuyện từ hệ sinh thái đổi mới sáng tạo.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="py-12">
        <Container>
          {/* Category filter — Component mới */}
          <NewsCategoryFilter />

          {articles.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📰</p>
              <p className="font-medium">Chưa có bài viết nào.</p>
            </div>
          ) : (
            <>
              {/* Featured article (trang 1) */}
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
                      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                        {featured.category}
                      </span>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors line-clamp-3">
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
                {filteredArticles.map(article => (
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
                        <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2 block">
                          {article.category}
                        </span>
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5" />
                            {fmtDate(article.published_at)}
                          </span>
                          <span className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
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