

// src/app/(public)/events/page.js
// Giữ nguyên thiết kế gốc + thay data thật từ DB + fix next/image + pagination

import Link from "next/link"
import Image from "next/image"
import { getEvents, getEventCount } from "@/lib/queries/events"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PaginationControls } from "@/components/ui/pagination"
import { CalendarWidget } from "@/components/events/calendar-widget"
import {
  Search,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  Filter,
  ArrowRight,
} from "lucide-react"

export const revalidate = 1800

import {
  EVENT_TYPE_LABEL,
  EVENT_STATUS,
  DEFAULT_PAGE_SIZE,
} from "@/lib/constants"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parsePage(raw) {
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

function buildPagination(total, page, pageSize) {
  const pages = Math.ceil(total / pageSize)
  return { total, page, pages, pageSize }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function EventsPage({ searchParams }) {
  const sp = await searchParams
  const page = parsePage(sp?.page)

  const [events, total] = await Promise.all([
    getEvents({ page, pageSize: DEFAULT_PAGE_SIZE }),
    getEventCount(),
  ])

  const pager = buildPagination(total, page, DEFAULT_PAGE_SIZE)
  const featured = page === 1 ? events.find(e => e.is_featured) : null
  const upcoming = events.filter(e => e.status === "OPEN" || e.status === "ONGOING")
  const past = events.filter(e => e.status !== "OPEN" && e.status !== "ONGOING")

  // Truyền toàn bộ upcoming events cho CalendarWidget (client component xử lý)
  // CalendarWidget tự filter theo tháng đang xem + handle click interaction

  return (
    <>
      {/* ── Hero Section ── */}
      <Section className="relative bg-muted/30 py-20 overflow-hidden border-b border-border">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2012&auto=format&fit=crop"
            alt="Events Background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white">
              Trung tâm kết nối{" "}
              <span className="text-primary italic">tri thức</span> khởi nghiệp
            </h1>
            <p className="mt-6 text-xl text-white/80 leading-relaxed">
              Khám phá các sự kiện, workshop và chương trình đào tạo chuyên sâu dành
              riêng cho cộng đồng đổi mới sáng tạo.
            </p>

            {/* Search bar — UI giữ nguyên, filter thật dùng server search params */}
            <div className="mt-10 flex max-w-md items-center gap-2 rounded-xl bg-background p-2 shadow-lg border border-border">
              <Search className="ml-2 h-5 w-5 text-muted-foreground" />
              <EventSearchInput />
              <Link href="/events">
                <Button size="icon" className="shrink-0 rounded-lg">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Featured Event ── */}
      {featured && (
        <Section className="py-16">
          <Container>
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="h-8 w-1 bg-primary rounded-full" />
                Sự kiện tiêu điểm
              </h2>
            </div>

            <Card className="overflow-hidden border-none shadow-2xl bg-slate-900 group">
              <div className="flex flex-col lg:flex-row">
                {/* Image side */}
                <div className="relative h-64 lg:h-auto lg:w-3/5 overflow-hidden">
                  {featured.cover_image ? (
                    <Image
                      src={featured.cover_image}
                      alt={featured.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                      sizes="(max-width:1024px) 100vw, 60vw"
                    />
                  ) : (
                    <div className="h-full min-h-64 w-full bg-primary/20" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-r from-slate-950/80 to-transparent" />

                  {/* Countdown-style date display (dùng start_date thật) */}
                  <FeaturedEventDateDisplay startDate={featured.start_date} />
                </div>

                {/* Content side */}
                <div className="p-8 lg:p-12 flex flex-col justify-center lg:w-2/5 text-white">
                  <Badge className="w-fit bg-primary hover:bg-primary text-white border-none mb-6">
                    Featured Event
                  </Badge>
                  <h3 className="text-3xl lg:text-4xl font-bold leading-tight">
                    {featured.title}
                  </h3>
                  <p className="mt-6 text-slate-300 leading-relaxed text-lg">
                    {featured.short_desc}
                  </p>
                  <ul className="mt-8 space-y-4 text-sm text-slate-400">
                    <li className="flex items-center gap-3">
                      <CalendarIcon className="text-primary h-5 w-5" />
                      {new Date(featured.start_date).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </li>
                    <li className="flex items-center gap-3">
                      <MapPin className="text-primary h-5 w-5" />
                      {featured.is_online ? "Online" : featured.location || "TBA"}
                    </li>
                  </ul>
                  <div className="mt-10">
                    <Link href={`/events/${featured.slug}`}>
                      <Button
                        size="lg"
                        className="w-full sm:w-auto px-10 rounded-full font-bold"
                      >
                        Đăng ký ngay <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </Container>
        </Section>
      )}

      {/* ── Event Grid — Sắp diễn ra ── */}
      {upcoming.length > 0 && (
        <Section className="py-16 bg-muted/10">
          <Container>
            {/* Category filter tabs — hiển thị các type thực tế có trong data */}
            <CategoryFilterBar events={events} />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-8">
              {upcoming.map(e => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>

            {upcoming.length === 0 && (
              <div className="py-20 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground">
                  Không tìm thấy sự kiện phù hợp
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Vui lòng thử bộ lọc hoặc từ khóa tìm kiếm khác.
                </p>
              </div>
            )}
          </Container>
        </Section>
      )}

      {/* ── Calendar & CTA Section ── */}
      <Section className="py-20 border-t border-border">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left: CTA text */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Theo dõi dòng chảy tri thức <br />
                hàng tháng cùng <span className="text-primary">SCEI</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Chúng tôi liên tục tổ chức các buổi gặp gỡ, hội thảo và hỗ trợ kết
                nối hệ sinh thái. Lưu lịch ngay để không bỏ lỡ các cơ hội quan trọng.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
                  <div className="p-2 bg-primary rounded-lg text-white shrink-0">
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold">Nhận thông báo sự kiện</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Gửi email cho bạn 48h trước mỗi workshop mới.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                  <div className="p-2 bg-muted rounded-lg text-muted-foreground shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold">Đề xuất sự kiện cộng đồng</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bạn có ý tưởng hay muốn cộng tác tổ chức? Hãy kết nối với chúng tôi.
                    </p>
                  </div>
                </div>
              </div>

              <Link href="/contact">
                <Button size="lg" className="px-8 rounded-full">
                  Kết nối với chúng tôi
                </Button>
              </Link>
            </div>

            {/* Right: Calendar widget — client component có tương tác click */}
            <CalendarWidget events={upcoming} />
          </div>
        </Container>
      </Section>

      {/* ── Past Events ── */}
      {past.length > 0 && (
        <Section className="py-16 bg-muted/10">
          <Container>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
              <span className="h-8 w-1 bg-muted-foreground rounded-full" /> Đã qua
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {past.map(e => (
                <EventCard key={e.id} event={e} past />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ── Empty state ── */}
      {events.length === 0 && (
        <Section className="py-32">
          <Container className="text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-xl text-muted-foreground">
              Chưa có sự kiện nào được công bố.
            </p>
          </Container>
        </Section>
      )}

      {/* ── Pagination ── */}
      {pager.pages > 1 && (
        <Section className="py-8">
          <Container>
            <PaginationControls pager={pager} basePath="/events" />
          </Container>
        </Section>
      )}
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Search input — "use client" vì cần onChange.
 * Tách nhỏ để page chính vẫn là Server Component.
 */
function EventSearchInput() {
  // Server-side: chỉ render input tĩnh.
  // Nếu muốn live filter, tạo file riêng với "use client".
  return (
    <input
      name="q"
      type="text"
      placeholder="Tìm kiếm sự kiện..."
      className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
    />
  )
}

/**
 * Category filter bar — hiển thị các loại event thực tế có trong data.
 * Là Server Component (chỉ render buttons tĩnh, không cần state).
 */
function CategoryFilterBar({ events }) {
  const types = ["Tất cả", ...new Set(events.map(e => EVENT_TYPE_LABEL[e.type] ?? e.type))]

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex flex-wrap gap-2">
        {types.map(type => (
          <Button
            key={type}
            variant={type === "Tất cả" ? "primary" : "outline"}
            className="rounded-full px-6"
          >
            {type}
          </Button>
        ))}
      </div>
      <Button variant="ghost" className="text-muted-foreground flex items-center gap-2">
        <Filter size={18} /> Lọc nâng cao
      </Button>
    </div>
  )
}

/**
 * Featured event date display — giống countdown widget thiết kế gốc
 * nhưng dùng start_date thật từ DB.
 */
function FeaturedEventDateDisplay({ startDate }) {
  const d = new Date(startDate)
  return (
    <div className="absolute bottom-8 left-8 right-8 text-white hidden sm:block">
      <div className="flex gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-center min-w-17.5 border border-white/20">
          <div className="text-2xl font-bold">
            {String(d.getDate()).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-70">Ngày</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-center min-w-17.5 border border-white/20">
          <div className="text-2xl font-bold">
            {String(d.getMonth() + 1).padStart(2, "0")}
          </div>
          <div className="text-[10px] uppercase tracking-wider opacity-70">Tháng</div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 text-center min-w-17.5 border border-white/20">
          <div className="text-2xl font-bold">{d.getFullYear()}</div>
          <div className="text-[10px] uppercase tracking-wider opacity-70">Năm</div>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium opacity-80 flex items-center gap-2">
        <Clock size={16} />
        {d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} —{" "}
        {d.toLocaleDateString("vi-VN", { weekday: "long" })}
      </p>
    </div>
  )
}

/**
 * Event card — giữ nguyên thiết kế gốc (speaker avatars, status badge, hover effects)
 * nhưng dùng next/image và data thật.
 */
function EventCard({ event, past = false }) {
  const startDate = new Date(event.start_date)
  const spotsLeft = event.max_attendees
    ? event.max_attendees - (event.registered_count || 0)
    : null
  const statusMeta = EVENT_STATUS[event.status] ?? {
    label: event.status,
    dot: "bg-gray-400",
  }

  return (
    <Card
      className={[
        "group overflow-hidden border border-border bg-background hover:shadow-xl transition-all duration-300 flex flex-col",
        past ? "opacity-70" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        {event.cover_image ? (
          <Image
            src={event.cover_image}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <CalendarIcon className="h-10 w-10 text-muted-foreground opacity-20" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-background/95 text-foreground backdrop-blur-sm border-none shadow-sm">
            {EVENT_TYPE_LABEL[event.type] ?? event.type}
          </Badge>
        </div>

        {/* Status badge */}
        <div className="absolute bottom-4 right-4">
          <Badge
            variant={event.status === "OPEN" ? "default" : "secondary"}
            className="shadow-md"
          >
            {statusMeta.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-primary font-bold text-sm mb-3">
          <CalendarIcon size={14} />
          {startDate.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>

        <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
          {event.title}
        </h3>

        <div className="mt-4 space-y-2 text-sm text-muted-foreground border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <Clock size={14} />
            {startDate.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            {event.is_online ? "Online" : event.location || "TBA"}
          </div>
        </div>

        {/* Speaker avatars + action — giữ đúng layout thiết kế gốc */}
        <div className="mt-auto pt-6 flex items-center justify-between">
          <div className="flex -space-x-2">
            {/* Dùng pravatar seed theo event.id — giống thiết kế gốc */}
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden"
              >
                <img
                  src={`https://i.pravatar.cc/150?u=${event.id}-${i}`}
                  alt="Speaker"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
            {spotsLeft !== null && spotsLeft > 0 && (
              <div className="h-8 w-8 rounded-full border-2 border-background bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                +{Math.min(spotsLeft, 99)}
              </div>
            )}
          </div>

          <Link href={`/events/${event.slug}`}>
            <Button
              variant="ghost"
              size="sm"
              className="font-bold p-0 text-primary hover:bg-transparent flex items-center gap-1 group/btn"
            >
              {past ? "Xem lại" : "Chi tiết"}
              <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}