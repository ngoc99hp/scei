// src/app/(admin)/admin/page.js
// Dashboard — redesigned với quick actions + recent activity

import { getServerSession } from "next-auth"
import { authOptions }      from "@/lib/auth.config"
import { redirect }         from "next/navigation"
import sql                  from "@/lib/db"
import Link                 from "next/link"
import {
  Newspaper, CalendarDays, GraduationCap, BookOpen,
  Rocket, Users2, ClipboardList, FileText,
  MessageSquare, Plus, ArrowRight, TrendingUp,
  Clock, CheckCircle2, AlertCircle,
} from "lucide-react"

export const dynamic  = "force-dynamic"
export const metadata = { title: "Dashboard" }

// ─── Data fetching ────────────────────────────────────────────
async function getStats() {
  const [
    eventsOpen, programsOpen,
    registrationsTotal, applicationsNew,
    contactsNew, articlesDraft,
    resourcesUnpublished, startupsTotal,
  ] = await Promise.all([
    sql`SELECT COUNT(*) c FROM events   WHERE status IN ('OPEN','ONGOING')`,
    sql`SELECT COUNT(*) c FROM programs WHERE status = 'OPEN'`,
    sql`SELECT COUNT(*) c FROM event_registrations`,
    sql`SELECT COUNT(*) c FROM applications WHERE status = 'PENDING'`,
    sql`SELECT COUNT(*) c FROM contacts    WHERE status = 'NEW'`,
    sql`SELECT COUNT(*) c FROM articles    WHERE status = 'DRAFT'`,
    sql`SELECT COUNT(*) c FROM resources   WHERE is_published = false`,
    sql`SELECT COUNT(*) c FROM startups    WHERE is_published = true`,
  ])

  return {
    eventsOpen:          Number(eventsOpen[0]?.c          ?? 0),
    programsOpen:        Number(programsOpen[0]?.c        ?? 0),
    registrationsTotal:  Number(registrationsTotal[0]?.c  ?? 0),
    applicationsNew:     Number(applicationsNew[0]?.c     ?? 0),
    contactsNew:         Number(contactsNew[0]?.c         ?? 0),
    articlesDraft:       Number(articlesDraft[0]?.c       ?? 0),
    resourcesUnpublished:Number(resourcesUnpublished[0]?.c?? 0),
    startupsTotal:       Number(startupsTotal[0]?.c       ?? 0),
  }
}

async function getRecentRegistrations() {
  return sql`
    SELECT er.id, er.name, er.email, er.organization, er.created_at,
           e.title  AS event_title,
           e.slug   AS event_slug
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    ORDER BY er.created_at DESC
    LIMIT 6
  `
}

async function getRecentApplications() {
  return sql`
    SELECT id, applicant_name, startup_name, status, created_at
    FROM applications
    ORDER BY created_at DESC
    LIMIT 5
  `
}

async function getRecentContacts() {
  return sql`
    SELECT id, full_name, subject, status, created_at
    FROM contacts
    ORDER BY created_at DESC
    LIMIT 5
  `
}

// ─── Helpers ─────────────────────────────────────────────────
function fmt(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
}
function fmtFull(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

const APP_STATUS_LABEL = {
  PENDING:    { label: "Chờ duyệt",  color: "bg-amber-100 text-amber-700" },
  REVIEWING:  { label: "Đang xét",   color: "bg-blue-100 text-blue-700" },
  APPROVED:   { label: "Chấp nhận",  color: "bg-green-100 text-green-700" },
  REJECTED:   { label: "Từ chối",    color: "bg-red-100 text-red-700" },
  WAITLISTED: { label: "Chờ",        color: "bg-gray-100 text-gray-600" },
}
const CONTACT_STATUS_LABEL = {
  NEW:     { label: "Mới",         color: "bg-blue-100 text-blue-700" },
  READING: { label: "Đang đọc",   color: "bg-purple-100 text-purple-700" },
  REPLIED: { label: "Đã trả lời", color: "bg-green-100 text-green-700" },
  CLOSED:  { label: "Đóng",       color: "bg-gray-100 text-gray-500" },
}

// ─── Sub-components ───────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, bg, href, badge }) {
  return (
    <Link
      href={href}
      className={`group relative flex items-start justify-between rounded-xl p-4 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 bg-card overflow-hidden`}
    >
      {/* Subtle bg accent */}
      <div className={`absolute inset-0 ${bg} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

      <div className="relative z-10">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString("vi-VN")}</p>
        {badge && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
            <AlertCircle size={9} />
            {badge}
          </span>
        )}
      </div>

      <div className={`relative z-10 w-9 h-9 rounded-lg ${bg.replace("opacity-0", "")} flex items-center justify-center shrink-0 border border-border`}>
        <Icon size={16} className={color} />
      </div>

      <ArrowRight size={14} className="absolute bottom-3 right-3 text-muted-foreground/30 group-hover:text-primary/50 group-hover:translate-x-0.5 transition-all" />
    </Link>
  )
}

function QuickAction({ href, icon: Icon, label, desc }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon size={15} className="text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{label}</p>
        <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
      </div>
      <Plus size={14} className="text-muted-foreground/40 group-hover:text-primary shrink-0 ml-auto transition-colors" />
    </Link>
  )
}

function SectionHeader({ title, href, linkLabel = "Xem tất cả" }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <Link href={href} className="text-xs text-primary hover:underline flex items-center gap-0.5">
        {linkLabel} <ArrowRight size={11} />
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────
export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/admin/login")
  if (session.user.role !== "ADMIN") redirect("/admin/login")

  const [stats, registrations, applications, contacts] = await Promise.all([
    getStats(),
    getRecentRegistrations(),
    getRecentApplications(),
    getRecentContacts(),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối"

  return (
    <div className="p-5 max-w-7xl mx-auto space-y-6">

      {/* ── Greeting ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {greeting}, {session.user.name?.split(" ").pop()} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Alerts */}
        {(stats.applicationsNew > 0 || stats.contactsNew > 0) && (
          <div className="flex items-center gap-2">
            {stats.applicationsNew > 0 && (
              <Link href="/admin/applications" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors">
                <AlertCircle size={12} />
                {stats.applicationsNew} đơn mới
              </Link>
            )}
            {stats.contactsNew > 0 && (
              <Link href="/admin/contacts" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors">
                <MessageSquare size={12} />
                {stats.contactsNew} liên hệ mới
              </Link>
            )}
          </div>
        )}
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Sự kiện đang mở"       value={stats.eventsOpen}           icon={CalendarDays}  color="text-blue-600"   bg="bg-blue-50"    href="/admin/events" />
        <StatCard label="Chương trình mở"        value={stats.programsOpen}         icon={GraduationCap} color="text-green-600"  bg="bg-green-50"   href="/admin/programs" />
        <StatCard label="Tổng đăng ký"           value={stats.registrationsTotal}   icon={ClipboardList} color="text-purple-600" bg="bg-purple-50"  href="/admin/registrations" />
        <StatCard
          label="Đơn xét tuyển chờ duyệt"
          value={stats.applicationsNew}
          icon={FileText}
          color="text-amber-600"
          bg="bg-amber-50"
          href="/admin/applications"
          badge={stats.applicationsNew > 0 ? "Cần xử lý" : null}
        />
        <StatCard label="Startup đang hoạt động" value={stats.startupsTotal}        icon={Rocket}        color="text-rose-600"   bg="bg-rose-50"    href="/admin/startups" />
        <StatCard label="Bài viết nháp"          value={stats.articlesDraft}        icon={Newspaper}     color="text-gray-600"   bg="bg-gray-50"    href="/admin/articles" />
        <StatCard label="Tài nguyên chưa publish" value={stats.resourcesUnpublished} icon={BookOpen}      color="text-orange-600" bg="bg-orange-50"  href="/admin/resources" />
        <StatCard
          label="Liên hệ chưa đọc"
          value={stats.contactsNew}
          icon={MessageSquare}
          color="text-sky-600"
          bg="bg-sky-50"
          href="/admin/contacts"
          badge={stats.contactsNew > 0 ? "Mới" : null}
        />
      </div>

      {/* ── Quick actions ── */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp size={15} className="text-primary" />
          Thao tác nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <QuickAction href="/admin/articles/new"  icon={Newspaper}     label="Viết bài mới"          desc="Tạo bài viết & publish" />
          <QuickAction href="/admin/events/new"    icon={CalendarDays}  label="Tạo sự kiện"           desc="Workshop, seminar, pitching" />
          <QuickAction href="/admin/programs/new"  icon={GraduationCap} label="Mở chương trình"       desc="Ươm tạo, tăng tốc" />
          <QuickAction href="/admin/resources/new" icon={BookOpen}      label="Thêm tài nguyên"       desc="Document, video, template" />
        </div>
      </div>

      {/* ── 3-column activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Registrations */}
        <div className="bg-card rounded-xl border border-border p-4">
          <SectionHeader title="Đăng ký sự kiện gần đây" href="/admin/registrations" />
          {registrations.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Chưa có đăng ký</p>
          ) : (
            <ul className="space-y-2.5">
              {registrations.map((r) => (
                <li key={r.id} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-semibold text-purple-600">
                      {(r.name ?? "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-foreground truncate">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{r.event_title}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{fmt(r.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Applications */}
        <div className="bg-card rounded-xl border border-border p-4">
          <SectionHeader title="Đơn xét tuyển gần đây" href="/admin/applications" />
          {applications.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Chưa có đơn nào</p>
          ) : (
            <ul className="space-y-2.5">
              {applications.map((a) => {
                const s = APP_STATUS_LABEL[a.status] ?? { label: a.status, color: "bg-gray-100 text-gray-600" }
                return (
                  <li key={a.id} className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-semibold text-amber-600">
                        {(a.startup_name ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{a.startup_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{a.applicant_name}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${s.color}`}>
                      {s.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Contacts */}
        <div className="bg-card rounded-xl border border-border p-4">
          <SectionHeader title="Liên hệ gần đây" href="/admin/contacts" />
          {contacts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Chưa có liên hệ</p>
          ) : (
            <ul className="space-y-2.5">
              {contacts.map((c) => {
                const s = CONTACT_STATUS_LABEL[c.status] ?? { label: c.status, color: "bg-gray-100 text-gray-600" }
                return (
                  <li key={c.id} className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-semibold text-sky-600">
                        {(c.full_name ?? "?")[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{c.full_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{c.subject}</p>
                    </div>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${s.color}`}>
                      {s.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

    </div>
  )
}