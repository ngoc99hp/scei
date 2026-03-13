// src/app/(public)/startups/page.js
import Link from "next/link"
import Image from "next/image"
import { getStartups, getStartupStats, getStartupCount } from "@/lib/queries/startups"
import { STARTUP_STAGE_LABEL, STARTUP_STATUS_LABEL, DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { buildPagination, parsePage } from "@/lib/pagination"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Rocket, TrendingUp, DollarSign, Briefcase, ArrowRight, ExternalLink, Plus } from "lucide-react"
import { PaginationControls } from "@/components/ui/pagination"

export const revalidate = 3600

export default async function StartupsPage({ searchParams }) {
  const sp   = await searchParams
  const page = parsePage(sp?.page)

  const [startups, stats, total] = await Promise.all([
    getStartups({ page, pageSize: DEFAULT_PAGE_SIZE }),
    getStartupStats(),
    getStartupCount(),
  ])

  const pager    = buildPagination(total, page, DEFAULT_PAGE_SIZE)
  const featured = startups.filter(s => s.is_featured)
  const others   = startups.filter(s => !s.is_featured)

  const statCards = [
    { label: "Startups năng động", value: `${stats.total}+`,  icon: <Rocket className="h-5 w-5" /> },
    { label: "Vốn đã huy động",   value: `$${Math.round(stats.totalFunding / 1000)}K+`, icon: <DollarSign className="h-5 w-5" /> },
    { label: "Việc làm tạo ra",   value: `${stats.totalTeam}+`, icon: <Briefcase className="h-5 w-5" /> },
    { label: "Tỷ lệ sống sót",    value: "85%", icon: <TrendingUp className="h-5 w-5" /> },
  ]

  return (
    <>
      <Section className="relative py-24 overflow-hidden bg-background">
        <Container className="relative z-10 text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1 rounded-full font-medium">Hệ sinh thái SCEI</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-[1.1]">
            Hệ sinh thái <span className="text-primary">Startups</span>
          </h1>
          <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
            Nơi hội tụ những ý tưởng đột phá và những nhà sáng lập đầy khao khát.
          </p>
        </Container>
      </Section>

      <Section className="py-12 border-y border-border bg-muted/30">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-8 bg-background rounded-2xl shadow-sm border border-border/50 text-center group hover:border-primary/50 transition-colors">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {featured.length > 0 && page === 1 && (
        <Section className="py-24">
          <Container>
            <h2 className="text-3xl font-bold mb-2">Startup tiêu biểu</h2>
            <p className="text-muted-foreground mb-10">Những dự án nổi bật trong danh mục đầu tư của chúng tôi.</p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map(s => <StartupCard key={s.id} startup={s} />)}
            </div>
          </Container>
        </Section>
      )}

      <Section className="py-16 bg-muted/20">
        <Container>
          {others.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-8">Tất cả startup</h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {others.map(s => <StartupCard key={s.id} startup={s} />)}
              </div>
            </>
          ) : startups.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">Chưa có startup nào được đăng.</p>
          ) : null}

          {pager.pages > 1 && (
            <div className="mt-12">
              <PaginationControls pager={pager} basePath="/startups" />
            </div>
          )}
        </Container>
      </Section>

      {page === 1 && (
        <Section className="py-24 bg-primary/5">
          <Container>
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                  Tại sao các Startups chọn đồng hành cùng <span className="text-primary">SCEI?</span>
                </h2>
                <ul className="space-y-6">
                  {[
                    { title: "Mạng lưới cố vấn sâu rộng", desc: "Tiếp cận hơn 80 chuyên gia hàng đầu từ nhiều lĩnh vực." },
                    { title: "Cơ hội gọi vốn", desc: "Kết nối trực tiếp với 100+ nhà đầu tư và quỹ mạo hiểm toàn cầu." },
                    { title: "Không gian sáng tạo", desc: "Co-working Space hiện đại cùng cộng đồng cùng chí hướng." },
                    { title: "Hỗ trợ pháp lý & vận hành", desc: "Đội ngũ chuyên trách hỗ trợ từ khâu thành lập đến IPO." },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white mt-1"><Plus className="h-4 w-4" /></div>
                      <div><h4 className="font-bold text-lg mb-1">{item.title}</h4><p className="text-muted-foreground">{item.desc}</p></div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop"
                  alt="Startup team"
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}

function StartupCard({ startup }) {
  const status = STARTUP_STATUS_LABEL[startup.status] ?? { label: startup.status, color: "bg-gray-100 text-gray-700" }
  const stage  = STARTUP_STAGE_LABEL[startup.stage]   ?? startup.stage

  return (
    <Card className="group p-8 border border-border hover:shadow-xl transition-all duration-300">
      <div className="relative h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-6 overflow-hidden">
        {startup.logo ? (
          <Image src={startup.logo} alt={startup.name} fill className="object-cover" sizes="56px" />
        ) : (
          <span className="text-2xl font-bold text-primary">{startup.name[0]}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${status.color}`}>{status.label}</span>
        <span className="rounded-full border border-primary/30 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">{stage}</span>
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{startup.name}</h3>
      <p className="text-sm text-muted-foreground mb-1 font-medium">{startup.industry}</p>
      <p className="text-muted-foreground text-sm mb-6 line-clamp-3">{startup.tagline}</p>
      <Link href={`/startups/${startup.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary">
        Xem chi tiết <ExternalLink className="h-4 w-4" />
      </Link>
    </Card>
  )
}