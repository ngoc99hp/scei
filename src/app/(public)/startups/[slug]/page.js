// src/app/(public)/startups/[slug]/page.js
import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getStartupBySlug } from "@/lib/queries/startups"
import { STARTUP_STAGE_LABEL, STARTUP_STATUS_LABEL } from "@/lib/constants"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Globe, Linkedin, Facebook, Users, Calendar, DollarSign } from "lucide-react"

export const revalidate = 3600

export async function generateMetadata({ params }) {
  const { slug } = await params
  const s = await getStartupBySlug(slug)
  if (!s) return {}
  return { title: `${s.name} — SCEI`, description: s.tagline }
}

export default async function StartupDetailPage({ params }) {
  const { slug } = await params
  const s = await getStartupBySlug(slug)
  if (!s) notFound()

  const stageLabel  = STARTUP_STAGE_LABEL[s.stage]  ?? s.stage
  const statusMeta  = STARTUP_STATUS_LABEL[s.status] ?? { label: s.status, color: "bg-gray-100 text-gray-700" }

  return (
    <Section className="py-12">
      <Container>
        <Link href="/startups" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="flex items-start gap-6">
              <div className="relative h-20 w-20 rounded-2xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {s.logo ? (
                  <Image src={s.logo} alt={s.name} fill className="object-cover" sizes="80px" />
                ) : (
                  <span className="text-3xl font-bold text-primary">{s.name[0]}</span>
                )}
              </div>
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="border-primary text-primary">{stageLabel}</Badge>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusMeta.color}`}>{statusMeta.label}</span>
                  <Badge variant="outline">{s.industry}</Badge>
                </div>
                <h1 className="text-3xl font-bold">{s.name}</h1>
                <p className="text-muted-foreground mt-1">{s.tagline}</p>
              </div>
            </div>

            {/* Cover */}
            {s.cover_image && (
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <Image src={s.cover_image} alt={s.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 800px" />
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold mb-3">Về startup</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.description}</p>
            </div>

            {s.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {s.tags.map(tag => (
                  <span key={tag} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-bold mb-4">Thông tin</h3>
              <dl className="space-y-3 text-sm">
                {s.founded_year && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Thành lập: <strong className="text-foreground">{s.founded_year}</strong></span>
                  </div>
                )}
                {s.team_size && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    <span>Đội ngũ: <strong className="text-foreground">{s.team_size} người</strong></span>
                  </div>
                )}
                {s.funding_raised > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>Vốn: <strong className="text-foreground">${s.funding_raised.toLocaleString()}</strong></span>
                  </div>
                )}
              </dl>
              <div className="flex gap-3 mt-6">
                {s.website && (
                  <a href={s.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="h-9 px-3 gap-2 text-xs">
                      <Globe className="h-4 w-4" /> Website
                    </Button>
                  </a>
                )}
                {s.linkedin_url && (
                  <a href={s.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="h-9 px-3"><Linkedin className="h-4 w-4" /></Button>
                  </a>
                )}
                {s.facebook_url && (
                  <a href={s.facebook_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="h-9 px-3"><Facebook className="h-4 w-4" /></Button>
                  </a>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-4">Nhà sáng lập</h3>
              <p className="font-semibold">{s.founder_name}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.founder_email}</p>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  )
}