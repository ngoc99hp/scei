// src/app/(public)/programs/page.js
import Link from "next/link"
import Image from "next/image"
import { getPrograms, getProgramCount } from "@/lib/queries/programs"
import { PROGRAM_TYPE_LABEL, PROGRAM_STATUS_LABEL, DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { buildPagination, parsePage } from "@/lib/pagination"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users, ArrowRight, CheckCircle2 } from "lucide-react"
import { PaginationControls } from "@/components/ui/pagination"

export const revalidate = 3600

export default async function ProgramsPage({ searchParams }) {
  const sp   = await searchParams
  const page = parsePage(sp?.page)

  const [programs, total] = await Promise.all([
    getPrograms({ page, pageSize: DEFAULT_PAGE_SIZE }),
    getProgramCount(),
  ])

  const pager    = buildPagination(total, page, DEFAULT_PAGE_SIZE)
  const featured = programs.filter(p => p.is_featured)
  const others   = programs.filter(p => !p.is_featured)

  return (
    <>
      {/* Hero */}
      <Section className="relative bg-muted/30 py-20 overflow-hidden border-b border-border">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop"
            alt="Programs Background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10" />
        </div>
        <Container className="relative z-10 text-center md:text-left">
          <div className="max-w-3xl mx-auto md:mx-0">
            <Badge variant="outline" className="mb-6 border-white/40 text-white px-4 py-1 rounded-full font-medium bg-background/20 backdrop-blur-sm">
              Chương trình SCEI
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl leading-[1.1] text-white">
              Đồng hành từ <span className="text-primary italic">ý tưởng đến thành công</span>
            </h1>
            <p className="mt-6 text-xl text-white/80 leading-relaxed">
              Chọn chương trình phù hợp với giai đoạn phát triển của startup.
            </p>
          </div>
        </Container>
      </Section>

      {featured.length > 0 && page === 1 && (
        <Section className="py-16">
          <Container>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="h-8 w-1 bg-primary rounded-full" /> Chương trình nổi bật
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featured.map(p => <ProgramCard key={p.id} program={p} />)}
            </div>
          </Container>
        </Section>
      )}

      <Section className={`py-16 ${featured.length > 0 && page === 1 ? "bg-muted/20" : ""}`}>
        <Container>
          {others.length > 0 ? (
            <>
              {featured.length > 0 && page === 1 && (
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                  <span className="h-8 w-1 bg-primary rounded-full" /> Tất cả chương trình
                </h2>
              )}
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {others.map(p => <ProgramCard key={p.id} program={p} />)}
              </div>
            </>
          ) : programs.length === 0 ? (
            <p className="text-center text-muted-foreground text-xl py-16">
              Chưa có chương trình nào được công bố.
            </p>
          ) : null}

          {pager.pages > 1 && (
            <div className="mt-12">
              <PaginationControls pager={pager} basePath="/programs" />
            </div>
          )}
        </Container>
      </Section>

      <Section className="py-20 border-t border-border">
        <Container>
          <div className="rounded-3xl bg-primary p-12 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold mb-4">Chưa tìm thấy chương trình phù hợp?</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">Liên hệ để được tư vấn chương trình phù hợp nhất.</p>
            <Link href="/contact">
              <Button variant="primary-inverse" className="px-8 h-12 rounded-full font-bold">
                Liên hệ tư vấn <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  )
}

function ProgramCard({ program }) {
  const type   = PROGRAM_TYPE_LABEL[program.type]   ?? { label: program.type, color: "bg-gray-100 text-gray-700" }
  const status = PROGRAM_STATUS_LABEL[program.status] ?? { label: program.status, dot: "bg-gray-400" }
  const benefits = program.benefits?.slice(0, 3) ?? []
  const deadline = program.apply_deadline
    ? new Date(program.apply_deadline).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      {program.cover_image && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={program.cover_image}
            alt={program.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 400px"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
          <div className="absolute top-4 left-4">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${type.color}`}>{type.label}</span>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            <span className="text-xs font-medium text-white drop-shadow">{status.label}</span>
          </div>
        </div>
      )}
      <div className="p-6">
        {!program.cover_image && (
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${type.color}`}>{type.label}</span>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              <span className="text-xs text-muted-foreground">{status.label}</span>
            </div>
          </div>
        )}
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">{program.name}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">{program.short_desc}</p>
        {benefits.length > 0 && (
          <ul className="space-y-1.5 mb-5">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground line-clamp-1">{b}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            {program.max_applicants && (
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {program.max_applicants} suất</span>
            )}
            {deadline && (
              <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Hạn {deadline}</span>
            )}
          </div>
          <Link href={`/programs/${program.slug}`}>
            <Button className="h-8 px-4 text-xs rounded-full">Chi tiết <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}