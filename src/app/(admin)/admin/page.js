// src/app/(admin)/admin/page.js
// Dashboard admin — queries đã được sửa cho khớp schema thực tế.
//
// Những thay đổi so với bản cũ:
//   - event_registrations: không có cột status → đếm tất cả registrations
//   - events.status: OPEN | ONGOING (không có PUBLISHED)
//   - programs.status: OPEN (không có ACTIVE)
//   - users: không có cột role → đếm tất cả users
//   - resources: không có cột status → dùng is_published = false
//   - getRecentActivity: event_registrations không có user_id, status
//     → JOIN trực tiếp events, hiển thị người đăng ký gần nhất

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.config"
import { redirect } from "next/navigation"
import sql from "@/lib/db"
import Link from "next/link"

export const dynamic = "force-dynamic" // Dashboard luôn cần data mới nhất

async function getDashboardStats() {
  const [
    totalRegistrations,
    upcomingEvents,
    openPrograms,
    totalUsers,
    draftArticles,
    unpublishedResources,
  ] = await Promise.all([
    // Tổng số đăng ký sự kiện (event_registrations không có status)
    sql`SELECT COUNT(*) as count FROM event_registrations`,

    // Sự kiện đang mở hoặc đang diễn ra
    sql`SELECT COUNT(*) as count
        FROM events
        WHERE status IN ('OPEN', 'ONGOING')
          AND start_date > NOW() - INTERVAL '7 days'`,

    // Chương trình đang mở đăng ký
    sql`SELECT COUNT(*) as count
        FROM programs
        WHERE status = 'OPEN'`,

    // Tổng số tài khoản (users không có cột role)
    sql`SELECT COUNT(*) as count FROM users`,

    // Bài viết đang ở trạng thái nháp
    sql`SELECT COUNT(*) as count
        FROM articles
        WHERE status = 'DRAFT'`,

    // Tài nguyên chưa publish
    sql`SELECT COUNT(*) as count
        FROM resources
        WHERE is_published = false`,
  ])

  return {
    totalRegistrations:   Number(totalRegistrations[0]?.count   ?? 0),
    upcomingEvents:       Number(upcomingEvents[0]?.count       ?? 0),
    openPrograms:         Number(openPrograms[0]?.count         ?? 0),
    totalUsers:           Number(totalUsers[0]?.count           ?? 0),
    draftArticles:        Number(draftArticles[0]?.count        ?? 0),
    unpublishedResources: Number(unpublishedResources[0]?.count ?? 0),
  }
}

async function getRecentRegistrations() {
  // event_registrations schema: id, event_id, name, email, phone, organization, note, created_at
  return sql`
    SELECT
      er.id,
      er.name,
      er.email,
      er.organization,
      er.created_at,
      e.title as event_title,
      e.slug  as event_slug
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    ORDER BY er.created_at DESC
    LIMIT 8
  `
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/admin/login")
  if (session.user.role !== "ADMIN") redirect("/admin/login")

  const [stats, recentRegistrations] = await Promise.all([
    getDashboardStats(),
    getRecentRegistrations(),
  ])

  const statCards = [
    {
      label: "Tổng đăng ký sự kiện",
      value: stats.totalRegistrations,
      href:  "/admin/registrations",
      color: "text-blue-600",
      bg:    "bg-blue-50",
      icon:  "📋",
    },
    {
      label: "Sự kiện đang mở",
      value: stats.upcomingEvents,
      href:  "/admin/events",
      color: "text-primary",
      bg:    "bg-primary/5",
      icon:  "📅",
    },
    {
      label: "Chương trình mở đăng ký",
      value: stats.openPrograms,
      href:  "/admin/programs",
      color: "text-green-600",
      bg:    "bg-green-50",
      icon:  "🎯",
    },
    {
      label: "Tổng tài khoản",
      value: stats.totalUsers,
      href:  "/admin/users",
      color: "text-purple-600",
      bg:    "bg-purple-50",
      icon:  "👥",
    },
    {
      label: "Bài viết nháp",
      value: stats.draftArticles,
      href:  "/admin/articles",
      color: "text-gray-600",
      bg:    "bg-gray-50",
      icon:  "📝",
    },
    {
      label: "Tài nguyên chưa publish",
      value: stats.unpublishedResources,
      href:  "/admin/resources",
      color: "text-orange-600",
      bg:    "bg-orange-50",
      icon:  "📦",
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Xin chào, {session.user.name}. Đây là tổng quan hệ thống.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`${card.bg} rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                <p className={`text-3xl font-bold ${card.color}`}>
                  {card.value.toLocaleString("vi-VN")}
                </p>
              </div>
              <span className="text-2xl" aria-hidden="true">
                {card.icon}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Đăng ký sự kiện gần đây</h2>
          <Link
            href="/admin/registrations"
            className="text-sm text-primary hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        {recentRegistrations.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500">
            Chưa có đăng ký nào.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentRegistrations.map((item) => (
              <li
                key={item.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.name}
                    {item.organization && (
                      <span className="text-gray-400 font-normal">
                        {" "}— {item.organization}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Đăng ký:{" "}
                    <span className="font-medium">{item.event_title}</span>
                  </p>
                </div>
                <p className="text-xs text-gray-400 shrink-0 ml-4">
                  {new Date(item.created_at).toLocaleDateString("vi-VN")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}