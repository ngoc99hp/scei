// src/app/(public)/news/[slug]/page.js
//
// ✅ FIX Critical #3 — Sanitize article.content trước dangerouslySetInnerHTML
//    TRƯỚC: <div dangerouslySetInnerHTML={{ __html: article.content }} />
//           → XSS risk: nếu DB bị inject script, user bị tấn công
//    SAU:   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />
//           → Chỉ render HTML tags an toàn, block script/event handlers/javascript: URLs

import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getArticleBySlug, getRelatedArticles } from "@/lib/queries/articles"
import { sanitizeHtml } from "@/lib/sanitize"   // ✅ FIX — import sanitizer
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CalendarDays, Eye, Tag, ArrowRight } from "lucide-react"
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld"

const BASE = process.env.NEXT_PUBLIC_SITE_URL

import { generateArticleStaticParams } from "@/lib/generate-static-params"
export const generateStaticParams = generateArticleStaticParams

export const revalidate = 1800

export async function generateMetadata({ params }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return {}
  return {
    title: article.meta_title || `${article.title} — SCEI`,
    description: article.meta_desc || article.excerpt,
    alternates: { canonical: `${BASE}/news/${slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.cover_image ? [{ url: article.cover_image, width: 1200, height: 630 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.meta_desc || article.excerpt,
      images: article.cover_image ? [article.cover_image] : [],
    },
  }
}

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" }) : ""

export default async function ArticleDetailPage({ params }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const related = await getRelatedArticles(article.id, article.category, 3)

  // ✅ FIX — Sanitize content server-side, một lần duy nhất khi render
  // sanitizeHtml() chạy trong Server Component → không tốn bundle client
  const safeContent = sanitizeHtml(article.content)

  return (
    <>
      {/* Cover image */}
      {article.cover_image && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent" />
        </div>
      )}

      <Section className="py-12">
        <Container>
          <div className="grid gap-12 lg:grid-cols-4">
            {/* Main content */}
            <article className="lg:col-span-3 space-y-8">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Quay lại tin tức
              </Link>

              {/* Header */}
              <header className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {article.title}
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed">{article.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    {fmtDate(article.published_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {article.view_count?.toLocaleString("vi-VN") ?? 0} lượt xem
                  </span>
                </div>
                <hr className="border-gray-200" />
              </header>

              {/* Body — ✅ FIX: dùng safeContent đã sanitize thay vì article.content raw */}
              <div className="prose prose-gray prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-600 prose-p:leading-relaxed
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-blockquote:border-blue-500
                prose-strong:text-gray-800 prose-li:text-gray-600">
                <div dangerouslySetInnerHTML={{ __html: safeContent }} />
              </div>

              {/* Tags */}
              {article.tags?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {article.tags.map(tag => (
                    <span
                      key={tag}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-500 hover:border-gray-400 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              <Card className="p-5">
                <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                  Bài viết liên quan
                </h3>
                {related.length === 0 ? (
                  <p className="text-sm text-gray-400">Chưa có bài liên quan.</p>
                ) : (
                  <ul className="space-y-4">
                    {related.map(r => (
                      <li key={r.id}>
                        <Link href={`/news/${r.slug}`} className="group flex gap-3">
                          {r.cover_image && (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={r.cover_image}
                                alt={r.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform"
                                sizes="64px"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {r.title}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">{fmtDate(r.published_at)}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href="/news"
                  className="flex items-center gap-1 text-xs text-blue-600 font-medium mt-4 hover:gap-2 transition-all"
                >
                  Xem tất cả bài viết <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
            </aside>
          </div>
        </Container>
      </Section>
      {/* ✅ SEO — JSON-LD */}
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        url={`${BASE}/news/${slug}`}
        imageUrl={article.cover_image}
        authorName={article.author_name ?? "SCEI"}
        publishedAt={article.published_at}
        modifiedAt={article.updated_at}
        keywords={article.tags ?? []}
      />
      <BreadcrumbJsonLd items={[
        { name: "Trang chủ", href: "/" },
        { name: "Tin tức",   href: "/news" },
        { name: article.title, href: `/news/${slug}` },
      ]} />
    </>
  )
}