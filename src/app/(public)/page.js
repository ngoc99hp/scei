// src/app/(public)/page.js  (hoặc src/app/page.js tùy cấu trúc route group)
// Homepage — load data từ nhiều nguồn song song

import Link from "next/link"
import Image from "next/image"
import { getPrograms, getProgramCount } from "@/lib/queries/programs"
import { getStartups, getStartupStats } from "@/lib/queries/startups"
import { getMentors } from "@/lib/queries/mentors"
import { getEvents } from "@/lib/queries/events"
import { getArticles } from "@/lib/queries/articles"
import { PROGRAM_TYPE_LABEL, EVENT_TYPE_LABEL, STARTUP_STAGE_LABEL } from "@/lib/constants"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowRight, Rocket, Users, TrendingUp, Calendar,
  BookOpen, Star, MapPin, CalendarDays,
} from "lucide-react"

export const revalidate = 3600

export const metadata = {
  title: "SCEI — Trung tâm Hỗ trợ Khởi nghiệp Đổi mới Sáng tạo",
  description:
    "SCEI hỗ trợ các startup Việt Nam từ giai đoạn ý tưởng đến tăng trưởng thông qua các chương trình ươm tạo, tăng tốc và kết nối hệ sinh thái.",
}

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "long" }) : ""

export default async function HomePage() {
  // Fetch song song tất cả dữ liệu cần thiết
  const [
    featuredPrograms,
    featuredStartups,
    featuredMentors,
    upcomingEvents,
    latestArticles,
    stats,
    programCount,
  ] = await Promise.all([
    getPrograms({ featured: true, limit: 3 }),
    getStartups({ featured: true, limit: 6 }),
    getMentors({ featured: true, limit: 4 }),
    getEvents({ upcomingOnly: true, limit: 3 }),
    getArticles({ limit: 3 }),
    getStartupStats(),
    getProgramCount(),
  ])

  const STATS = [
    { icon: Rocket,    value: `${programCount}+`,                  label: "Chương trình" },
    { icon: TrendingUp, value: `${stats.total}+`,                  label: "Startup hỗ trợ" },
    { icon: Users,     value: `${stats.totalTeam}+`,               label: "Thành viên" },
    {
      icon: Star,
      value: stats.totalFunding >= 1_000_000
        ? `$${(stats.totalFunding / 1_000_000).toFixed(1)}M`
        : `$${(stats.totalFunding / 1000).toFixed(0)}K`,
      label: "Vốn huy động",
    },
  ]

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <Container className="relative py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Đang nhận hồ sơ chương trình 2025
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Hệ sinh thái khởi nghiệp
              <span className="block text-blue-200">đổi mới sáng tạo</span>
            </h1>
            <p className="text-blue-100 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl">
              SCEI đồng hành cùng các startup Việt Nam từ giai đoạn ý tưởng đến tăng trưởng —
              thông qua chương trình ươm tạo, tăng tốc và kết nối hệ sinh thái đầu tư.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/programs">
                <Button
                  size="lg"
                  className="rounded-full bg-white text-blue-700 hover:bg-blue-50 font-bold px-8"
                >
                  Xem chương trình <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/40 text-white hover:bg-white/10 font-semibold px-8"
                >
                  Liên hệ với chúng tôi
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ── STATS ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center py-8 px-6 text-center">
                <Icon className="w-6 h-6 text-blue-600 mb-3" />
                <p className="text-3xl font-extrabold text-gray-900 mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* ── FEATURED PROGRAMS ──────────────────────────────────── */}
      {featuredPrograms.length > 0 && (
        <Section className="py-16 md:py-20 bg-gray-50">
          <Container>
            <SectionHeader
              tag="Chương trình"
              title="Tham gia cùng SCEI"
              desc="Các chương trình ươm tạo và tăng tốc được thiết kế cho từng giai đoạn phát triển của startup."
              href="/programs"
            />
            <div className="grid gap-6 md:grid-cols-3">
              {featuredPrograms.map(p => {
                const typeInfo = PROGRAM_TYPE_LABEL[p.type] ?? { label: p.type, color: "" }
                const isOpen   = p.status === "OPEN"
                return (
                  <Link key={p.id} href={`/programs/${p.slug}`} className="group">
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                      {p.cover_image ? (
                        <div className="relative h-44 overflow-hidden">
                          <Image
                            src={p.cover_image}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="h-44 bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                          <Rocket className="w-12 h-12 text-blue-300" />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          {isOpen && (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Đang mở
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{p.short_desc}</p>
                        <span className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all mt-auto">
                          Tìm hiểu thêm <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </Container>
        </Section>
      )}

      {/* ── UPCOMING EVENTS ────────────────────────────────────── */}
      {upcomingEvents.length > 0 && (
        <Section className="py-16 md:py-20">
          <Container>
            <SectionHeader
              tag="Sự kiện"
              title="Sắp diễn ra"
              desc="Tham gia các workshop, pitching và networking để mở rộng kết nối trong hệ sinh thái khởi nghiệp."
              href="/events"
            />
            <div className="grid gap-5 md:grid-cols-3">
              {upcomingEvents.map(ev => (
                <Link key={ev.id} href={`/events/${ev.slug}`} className="group">
                  <Card className="h-full p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 text-xs font-semibold">
                        {EVENT_TYPE_LABEL[ev.type] ?? ev.type}
                      </span>
                      {ev.is_online ? (
                        <span className="text-xs text-gray-400">🌐 Online</span>
                      ) : (
                        ev.location && (
                          <span className="flex items-center gap-1 text-xs text-gray-400 min-w-0">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </span>
                        )
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {ev.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{ev.short_desc}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <CalendarDays className="w-4 h-4 text-blue-500" />
                      {fmtDate(ev.start_date)}
                      {ev.max_attendees && (
                        <span className="ml-auto text-green-600 font-medium">
                          {ev.max_attendees - (ev.registered_count || 0)} suất còn
                        </span>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── FEATURED STARTUPS ──────────────────────────────────── */}
      {featuredStartups.length > 0 && (
        <Section className="py-16 md:py-20 bg-gray-50">
          <Container>
            <SectionHeader
              tag="Startup"
              title="Hệ sinh thái của chúng tôi"
              desc="Các startup tiêu biểu đang được ươm tạo và tăng tốc tại SCEI."
              href="/startups"
            />
            <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {featuredStartups.map(s => (
                <Link key={s.id} href={`/startups/${s.slug}`} className="group">
                  <Card className="p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    {s.logo ? (
                      <div className="relative w-14 h-14 mb-3 rounded-xl overflow-hidden">
                        <Image
                          src={s.logo}
                          alt={s.name}
                          fill
                          className="object-contain"
                          sizes="56px"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 mb-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-600">{s.name[0]}</span>
                      </div>
                    )}
                    <p className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{STARTUP_STAGE_LABEL[s.stage] ?? s.stage}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── FEATURED MENTORS ───────────────────────────────────── */}
      {featuredMentors.length > 0 && (
        <Section className="py-16 md:py-20">
          <Container>
            <SectionHeader
              tag="Mentor"
              title="Đội ngũ cố vấn"
              desc="Các chuyên gia giàu kinh nghiệm đồng hành và hỗ trợ trực tiếp cho startup trong hành trình phát triển."
              href="/mentors"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredMentors.map(m => (
                <Link key={m.id} href={`/mentors/${m.slug}`} className="group">
                  <Card className="p-6 text-center hover:shadow-md transition-shadow">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                      {m.avatar ? (
                        <Image
                          src={m.avatar}
                          alt={m.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">{m.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{m.name}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{m.title}</p>
                    {m.organization && (
                      <p className="text-xs text-gray-400 mt-0.5">{m.organization}</p>
                    )}
                    {m.expertise?.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1 mt-3">
                        {m.expertise.slice(0, 2).map(e => (
                          <span key={e} className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs">
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── LATEST ARTICLES ────────────────────────────────────── */}
      {latestArticles.length > 0 && (
        <Section className="py-16 md:py-20 bg-gray-50">
          <Container>
            <SectionHeader
              tag="Tin tức"
              title="Góc kiến thức"
              desc="Bài viết, hướng dẫn và câu chuyện khởi nghiệp từ đội ngũ và cộng đồng SCEI."
              href="/news"
            />
            <div className="grid gap-6 md:grid-cols-3">
              {latestArticles.map(a => (
                <Link key={a.id} href={`/news/${a.slug}`} className="group">
                  <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                    {a.cover_image && (
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={a.cover_image}
                          alt={a.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 block">
                        {a.category}
                      </span>
                      <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                        {a.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{a.excerpt}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="bg-linear-to-br from-blue-600 to-indigo-700 text-white py-20">
        <Container className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Sẵn sàng bắt đầu hành trình?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Nộp đơn tham gia chương trình ươm tạo hoặc liên hệ để được tư vấn miễn phí.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/programs">
              <Button size="lg" className="rounded-full bg-white text-blue-700 hover:bg-blue-50 font-bold px-8">
                Xem chương trình <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 text-white hover:bg-white/10 font-semibold px-8"
              >
                Liên hệ ngay
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}

// ── Helper component ───────────────────────────────────────────
function SectionHeader({ tag, title, desc, href }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">{tag}</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h2>
        {desc && <p className="text-gray-500 mt-2 max-w-xl">{desc}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:gap-2.5 transition-all whitespace-nowrap"
        >
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}