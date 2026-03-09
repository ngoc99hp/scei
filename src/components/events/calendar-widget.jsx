"use client"

// src/components/events/calendar-widget.jsx
// Calendar widget có tương tác:
// - Click vào ngày → hiển thị danh sách events của ngày đó
// - Nhiều events cùng ngày → hiển thị hết
// - Dot indicator số lượng events

import { useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, Users, Clock } from "lucide-react"
import { EVENT_STATUS } from "@/lib/constants"

export function CalendarWidget({ events = [] }) {
  const now          = new Date()
  const [viewYear,  setViewYear]  = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())   // 0-indexed
  const [selectedDay, setSelectedDay] = useState(now.getDate()) // default = hôm nay

  const today      = now.getDate()
  const todayMonth = now.getMonth()
  const todayYear  = now.getFullYear()

  const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay() // 0 = CN

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  })

  // ── Build map: day → [events] cho tháng đang xem ─────────────────────────
  const eventsByDay = {}
  for (const e of events) {
    const d = new Date(e.start_date)
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const day = d.getDate()
      if (!eventsByDay[day]) eventsByDay[day] = []
      eventsByDay[day].push(e)
    }
  }

  // ── Events của ngày đang được chọn ───────────────────────────────────────
  const selectedEvents = eventsByDay[selectedDay] ?? []

  // ── Navigation ───────────────────────────────────────────────────────────
  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
    setSelectedDay(null)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
    setSelectedDay(null)
  }

  // ── Upcoming (dùng cho fallback khi không chọn ngày) ─────────────────────
  const upcoming = events
    .filter(e => new Date(e.start_date) >= now)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .slice(0, 5)

  return (
    <Card className="p-8 border-none shadow-[0_0_50px_-12px_rgba(36,99,235,0.2)] bg-background">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold capitalize">{monthLabel}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={prevMonth}
            aria-label="Tháng trước"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={nextMonth}
            aria-label="Tháng sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Day-of-week headers ── */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted-foreground mb-2">
        {["CN","T2","T3","T4","T5","T6","T7"].map(d => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* ── Day cells ── */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day        = i + 1
          const dayEvents  = eventsByDay[day] ?? []
          const hasEvent   = dayEvents.length > 0
          const isSelected = selectedDay === day
          const isToday    =
            day === today &&
            viewMonth === todayMonth &&
            viewYear === todayYear

          return (
            <button
              key={day}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              aria-label={`Ngày ${day}${hasEvent ? `, ${dayEvents.length} sự kiện` : ""}`}
              className={[
                "relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                hasEvent
                  ? isSelected
                    ? "bg-primary text-white font-bold shadow-lg ring-4 ring-primary/20 scale-110"
                    : "bg-primary/10 text-primary font-bold hover:bg-primary/20 cursor-pointer"
                  : isToday
                    ? "border-2 border-primary text-primary font-bold cursor-default"
                    : "hover:bg-muted text-foreground cursor-pointer",
              ].filter(Boolean).join(" ")}
            >
              <span>{day}</span>

              {/* Dot indicators — tối đa 3 dots cho nhiều events */}
              {hasEvent && (
                <span className="absolute bottom-1 flex gap-[3px] items-center">
                  {dayEvents.slice(0, 3).map((_, idx) => (
                    <span
                      key={idx}
                      className={[
                        "block h-1 w-1 rounded-full",
                        isSelected ? "bg-white" : "bg-primary",
                      ].join(" ")}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span
                      className={[
                        "text-[8px] leading-none font-bold",
                        isSelected ? "text-white" : "text-primary",
                      ].join(" ")}
                    >
                      +
                    </span>
                  )}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Event list panel ── */}
      <div className="mt-8 space-y-3">
        <div className="text-sm font-bold border-b border-border pb-2 uppercase tracking-widest opacity-50">
          {selectedDay && selectedEvents.length > 0
            ? `Sự kiện ngày ${selectedDay} tháng ${viewMonth + 1}`
            : selectedDay && selectedEvents.length === 0
              ? `Không có sự kiện ngày ${selectedDay}`
              : "Sắp tới trong tuần"}
        </div>

        {/* Danh sách events của ngày được chọn */}
        {selectedDay ? (
          selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Không có sự kiện nào vào ngày này.
            </p>
          ) : (
            selectedEvents.map(e => (
              <EventListItem key={e.id} event={e} />
            ))
          )
        ) : (
          /* Fallback: upcoming events khi chưa chọn ngày */
          upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Chưa có sự kiện sắp tới.
            </p>
          ) : (
            upcoming.map(e => (
              <EventListItem key={e.id} event={e} />
            ))
          )
        )}
      </div>
    </Card>
  )
}

// ─── Event list item ──────────────────────────────────────────────────────────

function EventListItem({ event }) {
  const d     = new Date(event.start_date)
  const label = d.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  })
  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const dotColor = EVENT_STATUS[event.status]?.dot ?? "bg-gray-400"

  return (
    <Link href={`/events/${event.slug}`}>
      <div className="flex items-center gap-3 group cursor-pointer rounded-lg p-2 -mx-2 hover:bg-muted/60 transition-colors">
        {/* Status dot */}
        <span
          className={[
            "h-2 w-2 rounded-full shrink-0",
            dotColor,
          ].join(" ")}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground capitalize">
            <span>{label}</span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> {time}
            </span>
          </div>
          <div className="text-sm font-semibold group-hover:text-primary transition-colors truncate">
            {event.title}
          </div>
          {event.max_attendees && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Users size={10} />
              {event.registered_count ?? 0}/{event.max_attendees} đã đăng ký
            </div>
          )}
        </div>

        {/* Arrow */}
        <ChevronRight
          size={16}
          className="text-muted-foreground opacity-40 group-hover:translate-x-1 group-hover:opacity-100 transition-all shrink-0"
        />
      </div>
    </Link>
  )
}