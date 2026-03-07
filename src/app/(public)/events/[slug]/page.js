// src/app/(public)/events/[slug]/page.js
import Link from "next/link"
import { notFound } from "next/navigation"
import { getEventBySlug } from "@/lib/queries/events"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, MapPin, Clock, Users } from "lucide-react"

export const revalidate = 1800

export async function generateMetadata({ params }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return {}
  return { title: `${event.title} — SCEI`, description: event.short_desc }
}

export default async function EventDetailPage({ params }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const isOpen    = event.status === "OPEN"
  const startDate = new Date(event.start_date)
  const endDate   = event.end_date ? new Date(event.end_date) : null
  const deadline  = event.register_deadline ? new Date(event.register_deadline) : null
  const spotsLeft = event.max_attendees ? event.max_attendees - (event.registered_count || 0) : null

  const fmt     = (d) => d?.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
  const fmtTime = (d) => d?.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

  return (
    <>
      {event.cover_image && (
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img src={event.cover_image} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      <Section className="py-12">
        <Container>
          <Link href="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" /> Quay lại sự kiện
          </Link>

          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="border-primary text-primary">{event.type}</Badge>
                  <Badge variant="outline">{event.status}</Badge>
                  {event.is_online && <Badge variant="outline">Online</Badge>}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
                <p className="mt-4 text-lg text-muted-foreground">{event.short_desc}</p>
              </div>

              <div className="whitespace-pre-line text-foreground/80 leading-relaxed">
                {event.description}
              </div>

              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => (
                    <span key={tag} className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card className="p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-4">Thông tin sự kiện</h3>
                <dl className="space-y-3 text-sm mb-6">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{fmt(startDate)}</p>
                      <p>{fmtTime(startDate)}{endDate ? ` – ${fmtTime(endDate)}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    {event.is_online ? (
                      <span>
                        Online
                        {event.online_link && (
                          <a href={event.online_link} className="text-primary ml-1" target="_blank" rel="noopener noreferrer">
                            → Link tham gia
                          </a>
                        )}
                      </span>
                    ) : (
                      <span>{event.location || "TBA"}</span>
                    )}
                  </div>
                  {event.max_attendees && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>
                        {event.registered_count || 0}/{event.max_attendees} đã đăng ký
                        {spotsLeft !== null && spotsLeft > 0 && (
                          <span className="text-green-600 ml-1">(còn {spotsLeft} suất)</span>
                        )}
                      </span>
                    </div>
                  )}
                  {deadline && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Hạn đăng ký: <strong className="text-foreground">{fmt(deadline)}</strong></span>
                    </div>
                  )}
                </dl>

                {isOpen ? (
                  <Link href={`/contact?event=${event.slug}`}>
                    <Button className="w-full rounded-full font-bold h-11">
                      Đăng ký tham gia
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full rounded-full font-bold h-11" disabled>
                    {event.status === "FULL" ? "Đã đủ chỗ" : "Không còn mở đăng ký"}
                  </Button>
                )}
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}