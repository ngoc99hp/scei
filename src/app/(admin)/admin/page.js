// src/app/(admin)/admin/page.js
// ✅ Fix: Replaced hardcoded fake numbers (15, 5, 12, 150) with real DB queries

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import sql from "@/lib/db"
import Link from "next/link"

// Revalidate mỗi 5 phút để dashboard không stale quá lâu
export const revalidate = 300

async function getDashboardStats() {
  const [
    pendingRegistrations,
    upcomingEvents,
    activePrograms,
    totalMembers,
    recentArticles,
    pendingResources,
  ] = await Promise.all([
    // Số đăng ký chờ duyệt
    sql`SELECT COUNT(*) as count FROM event_registrations WHERE status = 'PENDING'`,
    // Số sự kiện sắp diễn ra
    sql`SELECT COUNT(*) as count FROM events WHERE status = 'PUBLISHED' AND start_date > NOW()`,
    // Số chương trình đang hoạt động
    sql`SELECT COUNT(*) as count FROM programs WHERE status = 'ACTIVE'`,
    // Tổng thành viên
    sql`SELECT COUNT(*) as count FROM users WHERE role = 'USER'`,
    // Bài viết mới nhất chờ duyệt
    sql`SELECT COUNT(*) as count FROM articles WHERE status = 'DRAFT'`,
    // Tài nguyên chờ duyệt
    sql`SELECT COUNT(*) as count FROM resources WHERE status = 'PENDING'`,
  ])

  return {
    pendingRegistrations: Number(pendingRegistrations[0]?.count ?? 0),
    upcomingEvents: Number(upcomingEvents[0]?.count ?? 0),
    activePrograms: Number(activePrograms[0]?.count ?? 0),
    totalMembers: Number(totalMembers[0]?.count ?? 0),
    draftArticles: Number(recentArticles[0]?.count ?? 0),
    pendingResources: Number(pendingResources[0]?.count ?? 0),
  }
}

async function getRecentActivity() {
  return sql`
    SELECT 
      er.id,
      er.created_at,
      er.status,
      u.name as user_name,
      e.title as event_title
    FROM event_registrations er
    JOIN users u ON er.user_id = u.id
    JOIN events e ON er.event_id = e.id
    ORDER BY er.created_at DESC
    LIMIT 5
  `
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const [stats, recentActivity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(),
  ])

  const statCards = [
    {
      label: "Đăng ký chờ duyệt",
      value: stats.pendingRegistrations,
      href: "/admin/registrations",
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: "⏳",
    },
    {
      label: "Sự kiện sắp tới",
      value: stats.upcomingEvents,
      href: "/admin/events",
      color: "text-primary",
      bg: "bg-primary/5",
      icon: "📅",
    },
    {
      label: "Chương trình active",
      value: stats.activePrograms,
      href: "/admin/programs",
      color: "text-green-600",
      bg: "bg-green-50",
      icon: "🎯",
    },
    {
      label: "Tổng thành viên",
      value: stats.totalMembers,
      href: "/admin/users",
      color: "text-purple-600",
      bg: "bg-purple-50",
      icon: "👥",
    },
    {
      label: "Bài viết nháp",
      value: stats.draftArticles,
      href: "/admin/articles",
      color: "text-gray-600",
      bg: "bg-gray-50",
      icon: "📝",
    },
    {
      label: "Tài nguyên chờ",
      value: stats.pendingResources,
      href: "/admin/resources",
      color: "text-orange-600",
      bg: "bg-orange-50",
      icon: "📦",
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

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Hoạt động gần đây</h2>
          <Link
            href="/admin/registrations"
            className="text-sm text-primary hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-500">
            Chưa có hoạt động nào.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentActivity.map((item) => (
              <li
                key={item.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.user_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Đăng ký:{" "}
                    <span className="font-medium">{item.event_title}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : item.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status === "PENDING"
                      ? "Chờ duyệt"
                      : item.status === "APPROVED"
                        ? "Đã duyệt"
                        : "Từ chối"}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}