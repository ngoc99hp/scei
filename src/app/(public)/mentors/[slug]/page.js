// src/app/(public)/mentors/[slug]/page.js
import Link from "next/link"
import { notFound } from "next/navigation"
import sql from "@/lib/db"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Mail, Linkedin, Globe, Facebook } from "lucide-react"

export const revalidate = 3600

export async function generateMetadata({ params }) {
  const rows = await sql`SELECT name, short_bio FROM mentors WHERE slug = ${params.slug} LIMIT 1`
  if (!rows[0]) return {}
  return { title: `${rows[0].name} — SCEI`, description: rows[0].short_bio }
}

export default async function MentorDetailPage({ params }) {
  const rows = await sql`
    SELECT * FROM mentors WHERE slug = ${params.slug} AND is_published = true LIMIT 1
  `
  const m = rows[0]
  if (!m) notFound()

  return (
    <Section className="py-12">
      <Container>
        <Link href="/mentors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </Link>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Sidebar */}
          <Card className="p-8 text-center h-fit sticky top-24">
            <div className="h-40 w-40 rounded-full mx-auto mb-6 overflow-hidden bg-muted">
              {m.avatar
                ? <img src={m.avatar} alt={m.name} className="h-full w-full object-cover" />
                : <div className="h-full w-full flex items-center justify-center text-5xl font-bold text-primary">{m.name[0]}</div>
              }
            </div>
            <h1 className="text-2xl font-bold">{m.name}</h1>
            <p className="text-primary font-medium mt-1">{m.title}</p>
            {m.organization && <p className="text-muted-foreground text-sm mt-1">{m.organization}</p>}
            {m.years_exp && (
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-bold text-foreground">{m.years_exp}</span> năm kinh nghiệm
              </p>
            )}

            <div className="flex justify-center gap-3 mt-6">
              {m.linkedin_url && (
                <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="rounded-full h-10 w-10 p-0"><Linkedin className="h-4 w-4" /></Button>
                </a>
              )}
              {m.email && (
                <a href={`mailto:${m.email}`}>
                  <Button variant="outline" className="rounded-full h-10 w-10 p-0"><Mail className="h-4 w-4" /></Button>
                </a>
              )}
              {m.website && (
                <a href={m.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="rounded-full h-10 w-10 p-0"><Globe className="h-4 w-4" /></Button>
                </a>
              )}
              {m.facebook_url && (
                <a href={m.facebook_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="rounded-full h-10 w-10 p-0"><Facebook className="h-4 w-4" /></Button>
                </a>
              )}
            </div>
          </Card>

          {/* Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-3">Giới thiệu</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{m.bio}</p>
            </div>

            {m.expertise?.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-3">Chuyên môn</h2>
                <div className="flex flex-wrap gap-2">
                  {m.expertise.map(e => (
                    <span key={e} className="rounded-full bg-primary/10 text-primary px-3 py-1.5 text-sm font-medium">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {m.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {m.tags.map(tag => (
                  <span key={tag} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  )
}