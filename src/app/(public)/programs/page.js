// src/app/(public)/programs/page.js
import Link from "next/link"
import { getPrograms } from "@/lib/queries/programs"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users, ArrowRight, CheckCircle2 } from "lucide-react"

export const revalidate = 3600

const typeLabel = {
  INCUBATION:   { label: "Ươm tạo",    color: "bg-blue-50 text-blue-700 border-blue-200" },
  ACCELERATION: { label: "Tăng tốc",   color: "bg-purple-50 text-purple-700 border-purple-200" },
  COWORKING:    { label: "Co-working", color: "bg-green-50 text-green-700 border-green-200" },
}

const statusLabel = {
  OPEN:      { label: "Đang mở đăng ký", dot: "bg-green-500" },
  CLOSED:    { label: "Đã đóng",          dot: "bg-gray-400" },
  DRAFT:     { label: "Sắp mở",           dot: "bg-yellow-500" },
  COMPLETED: { label: "Đã kết thúc",      dot: "bg-gray-400" },
}

export default async function ProgramsPage() {
  const programs = await getPrograms()
  const featured = programs.filter(p => p.is_featured)
  const others   = programs.filter(p => !p.is_featured)

  return (
    <>
      {/* Hero */}
      <Section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <Container>
          <div className="max-w-3xl">
            <Badge variant="outline" className="mb-6 border-primary text-primary px-4 py-1 rounded-full font-medium">
              Chương trình SCEI
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl text-foreground leading-[1.1]">
              Đồng hành cùng bạn từ <span className="text-primary">ý tưởng đến thành công</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground leading-relaxed">
              Chọn chương trình phù hợp với giai đoạn phát triển của startup và bắt đầu hành trình cùng SCEI.
            </p>
          </div>
        </Container>
      </Section>

      {featured.length > 0 && (
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

      {others.length > 0 && (
        <Section className="py-16 bg-muted/20">
          <Container>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="h-8 w-1 bg-primary rounded-full" /> Tất cả chương trình
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {others.map(p => <ProgramCard key={p.id} program={p} />)}
            </div>
          </Container>
        </Section>
      )}

      {programs.length === 0 && (
        <Section className="py-32">
          <Container>
            <p className="text-center text-muted-foreground text-xl">Chưa có chương trình nào được công bố.</p>
          </Container>
        </Section>
      )}

      <Section className="py-20 border-t border-border">
        <Container>
          <div className="rounded-3xl bg-primary p-12 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold mb-4">Chưa tìm thấy chương trình phù hợp?</h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">Liên hệ để được tư vấn chương trình phù hợp nhất.</p>
            <Link href="/contact">
              <Button className="bg-white text-primary hover:bg-white/90 px-8 h-12 rounded-full font-bold">
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
  const type   = typeLabel[program.type]   || { label: program.type, color: "bg-gray-100 text-gray-700" }
  const status = statusLabel[program.status] || { label: program.status, dot: "bg-gray-400" }
  const benefits = program.benefits?.slice(0, 3) || []
  const deadline = program.apply_deadline
    ? new Date(program.apply_deadline).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300">
      {program.cover_image && (
        <div className="relative h-48 overflow-hidden">
          <img src={program.cover_image} alt={program.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
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