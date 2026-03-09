// src/app/(public)/programs/[slug]/page.js
import Link from "next/link"
import { notFound } from "next/navigation"
import { getProgramBySlug, getProgramApplicationCount } from "@/lib/queries/programs"
import Image from "next/image"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Users, CheckCircle2, ArrowLeft, ArrowRight, Clock } from "lucide-react"

export const revalidate = 3600

export async function generateMetadata({ params }) {
  const { slug } = await params
  const program = await getProgramBySlug(slug)
  if (!program) return {}
  return { title: `${program.name} — SCEI`, description: program.short_desc }
}

export default async function ProgramDetailPage({ params }) {
  const { slug } = await params
  const program = await getProgramBySlug(slug)
  if (!program) notFound()

  const count  = await getProgramApplicationCount(program.id)
  const isOpen = program.status === "OPEN"
  const fmt    = (d) => d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" }) : null

  return (
    <>
      {program.cover_image && (
        <div className="relative h-72 md:h-96 overflow-hidden">
          <Image src={program.cover_image} alt={program.name} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
        </div>
      )}

      <Section className="py-12">
        <Container>
          <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
          </Link>

          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge variant="outline" className="border-primary text-primary">{program.type}</Badge>
                  <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${isOpen ? "text-green-600" : "text-muted-foreground"}`}>
                    <span className={`h-2 w-2 rounded-full ${isOpen ? "bg-green-500" : "bg-gray-400"}`} />
                    {isOpen ? "Đang mở đăng ký" : program.status}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{program.name}</h1>
                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{program.short_desc}</p>
              </div>

              <div className="whitespace-pre-line text-foreground/80 leading-relaxed">{program.description}</div>

              {program.requirements?.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Yêu cầu tham gia</h2>
                  <ul className="space-y-2">
                    {program.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card className="p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-4">Đăng ký tham gia</h3>
                <div className="space-y-3 mb-6 text-sm">
                  {program.apply_deadline && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Hạn đăng ký: <strong className="text-foreground">{fmt(program.apply_deadline)}</strong></span>
                    </div>
                  )}
                  {program.start_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      <span>Bắt đầu: <strong className="text-foreground">{fmt(program.start_date)}</strong></span>
                    </div>
                  )}
                  {program.max_applicants && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Số suất: <strong className="text-foreground">{program.max_applicants}</strong></span>
                    </div>
                  )}
                </div>

                {isOpen ? (
                  <Link href={`/contact?program=${program.slug}`}>
                    <Button className="w-full rounded-full font-bold h-11">
                      Đăng ký ngay <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full rounded-full font-bold h-11" disabled>
                    {program.status === "CLOSED" ? "Đã đóng đăng ký" : "Chưa mở đăng ký"}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center mt-3">Miễn phí · Không lấy cổ phần</p>
              </Card>

              {program.benefits?.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-bold mb-4">Quyền lợi</h3>
                  <ul className="space-y-2.5">
                    {program.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{b}</span>
                      </li>
                    ))}
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