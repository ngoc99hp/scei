// src/app/(public)/mentors/page.js
import Link from "next/link"
import Image from "next/image"
import { getMentors, getMentorCount } from "@/lib/queries/mentors"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { buildPagination, parsePage } from "@/lib/pagination"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Globe, Handshake, Mail, Linkedin, ArrowRight } from "lucide-react"
import { PaginationControls } from "@/components/ui/pagination"

export const revalidate = 3600

export default async function MentorsPage({ searchParams }) {
  const sp         = await searchParams
  const page       = parsePage(sp?.page)

  const [mentors, totalCount] = await Promise.all([
    getMentors({ page, pageSize: DEFAULT_PAGE_SIZE }),
    getMentorCount(),
  ])

  const pager    = buildPagination(totalCount, page, DEFAULT_PAGE_SIZE)
  const featured = mentors.filter(m => m.is_featured)
  const others   = mentors.filter(m => !m.is_featured)

  const stats = [
    { label: "Cố vấn chuyên gia",  value: `${totalCount}+`, icon: <Users className="h-5 w-5" /> },
    { label: "Đối tác chiến lược", value: "100+",            icon: <Globe className="h-5 w-5" /> },
    { label: "Năm kinh nghiệm",    value: "15+",             icon: <Award className="h-5 w-5" /> },
    { label: "Startups hỗ trợ",    value: "150+",            icon: <Handshake className="h-5 w-5" /> },
  ]

  return (
    <>
      <Section className="relative py-24 overflow-hidden bg-background">
        <Container className="relative z-10 text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1 rounded-full font-medium">Mạng lưới chuyên gia</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl leading-[1.1]">
            Đội ngũ <span className="text-primary">Cố vấn</span>
          </h1>
          <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
            Được dẫn dắt bởi những chuyên gia hàng đầu, luôn sẵn sàng chia sẻ kiến thức.
          </p>
        </Container>
      </Section>

      <Section className="py-12 border-y border-border bg-muted/30">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-4 p-6 bg-background rounded-2xl shadow-sm border border-border/50">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{stat.icon}</div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {featured.length > 0 && page === 1 && (
        <Section className="py-24">
          <Container>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <span className="h-8 w-1 bg-primary rounded-full" /> Mentor nổi bật
            </h2>
            <p className="text-muted-foreground mb-10">Những chuyên gia được các startup SCEI tin tưởng nhất.</p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map(m => <MentorCard key={m.id} mentor={m} />)}
            </div>
          </Container>
        </Section>
      )}

      {others.length > 0 && (
        <Section className="py-16 bg-muted/20">
          <Container>
            <h2 className="text-2xl font-bold mb-8">Tất cả cố vấn</h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {others.map(m => <MentorCard key={m.id} mentor={m} />)}
            </div>

            {pager.pages > 1 && (
              <div className="mt-12">
                <PaginationControls pager={pager} basePath="/mentors" />
              </div>
            )}
          </Container>
        </Section>
      )}

      <Section className="py-20 bg-muted/30">
        <Container>
          <div className="relative rounded-[2.5rem] bg-primary p-12 lg:px-20 lg:py-16 text-white flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">Gia nhập mạng lưới Cố vấn của SCEI</h2>
              <p className="text-white/80 text-lg">Bạn muốn đóng góp cho sự phát triển của hệ sinh thái khởi nghiệp?</p>
            </div>
            <Link href="/contact">
              <Button className="px-10 h-14 rounded-full font-bold bg-white text-primary hover:bg-white/90 border-none shadow-lg">
                Đăng ký ngay <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}

// Pure Server Component — không có event handler
function MentorCard({ mentor }) {
  return (
    <Card className="group overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="relative h-64 overflow-hidden bg-muted">
        {mentor.avatar ? (
          <Image
            src={mentor.avatar}
            alt={mentor.name}
            fill
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-110"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-6xl font-bold text-primary/30">
            {mentor.name[0]}
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <div className="flex gap-3">
            {mentor.linkedin_url && (
              <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-primary hover:border-primary h-9 w-9 p-0">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </a>
            )}
            {mentor.email && (
              <a href={`mailto:${mentor.email}`}>
                <Button variant="outline" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-primary hover:border-primary h-9 w-9 p-0">
                  <Mail className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {mentor.expertise?.slice(0, 2).map(e => (
            <span key={e} className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">{e}</span>
          ))}
          {mentor.expertise?.length > 2 && <span className="text-xs text-muted-foreground">+{mentor.expertise.length - 2}</span>}
        </div>
        <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
          <Link href={`/mentors/${mentor.slug}`}>{mentor.name}</Link>
        </h3>
        <p className="text-sm text-primary font-medium mb-1">{mentor.title}</p>
        {mentor.organization && <p className="text-xs text-muted-foreground mb-3">{mentor.organization}</p>}
        <p className="text-muted-foreground text-sm line-clamp-3">{mentor.short_bio}</p>
        {mentor.years_exp && (
          <p className="text-xs text-muted-foreground mt-3">
            <span className="font-bold text-foreground">{mentor.years_exp} năm</span> kinh nghiệm
          </p>
        )}
      </div>
    </Card>
  )
}