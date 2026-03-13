// src/app/(public)/page.js

import Link from "next/link";
import Image from "next/image";
import { getPrograms, getProgramCount } from "@/lib/queries/programs";
import { getStartups, getStartupStats } from "@/lib/queries/startups";
import { getMentors } from "@/lib/queries/mentors";
import { getEvents } from "@/lib/queries/events";
import { getArticles } from "@/lib/queries/articles";
import {
  PROGRAM_TYPE_LABEL,
  EVENT_TYPE_LABEL,
  STARTUP_STAGE_LABEL,
} from "@/lib/constants";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Rocket,
  Users,
  TrendingUp,
  Star,
  MapPin,
  CalendarDays,
  Quote,
  Lightbulb,
  HandshakeIcon,
  BarChart3,
} from "lucide-react";

export const revalidate = 3600;

export const metadata = {
  title: "SCEI — Trung tâm Hỗ trợ Khởi nghiệp Đổi mới Sáng tạo",
  description:
    "SCEI hỗ trợ các startup Việt Nam từ giai đoạn ý tưởng đến tăng trưởng thông qua các chương trình ươm tạo, tăng tốc và kết nối hệ sinh thái.",
};

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "long" })
    : "";

// ── Dữ liệu tĩnh Sprint 2 ─────────────────────────────────────

// [S2-2] Partners — thay bằng logo thật sau
const PARTNERS = [
  { name: "Bộ KH&CN" },
  { name: "Vietnam Ventures" },
  { name: "National iHub" },
  { name: "Mekong Capital" },
  { name: "Do Ventures" },
];

// [S2-4] Testimonials
const TESTIMONIALS = [
  {
    quote:
      "SCEI không chỉ cho chúng tôi văn phòng hay vốn — họ kết nối chúng tôi với đúng người vào đúng thời điểm. Chương trình acceleration đã thay đổi hoàn toàn cách chúng tôi nhìn nhận thị trường.",
    name: "Nguyễn Minh Khoa",
    title: "CEO & Co-founder",
    company: "FinEdu Technology",
    stage: "Series A — $2.1M",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=80",
  },
  {
    quote:
      "Mentor network của SCEI cực kỳ chất lượng. Chỉ trong 3 tháng incubation, chúng tôi đã hoàn thiện product-market fit và tìm được 2 enterprise clients đầu tiên nhờ giới thiệu từ mentor.",
    name: "Trần Thị Lan Anh",
    title: "Founder",
    company: "AgriSmart Vietnam",
    stage: "Pre-seed — $450K",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&q=80",
  },
  {
    quote:
      "Môi trường tại SCEI rất đặc biệt — bạn được bao quanh bởi những người cùng chí hướng, cùng đốt lửa. Coworking space và cộng đồng startup ở đây giúp chúng tôi vượt qua giai đoạn khó nhất.",
    name: "Lê Hoàng Phúc",
    title: "CTO & Co-founder",
    company: "EduTech Hub",
    stage: "Seed — $800K",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&q=80",
  },
];

// Giá trị cốt lõi cho About section
const VALUES = [
  {
    icon: Lightbulb,
    title: "Ươm tạo ý tưởng",
    desc: "Biến ý tưởng thô thành mô hình kinh doanh khả thi với sự hỗ trợ phương pháp luận và mentor.",
  },
  {
    icon: BarChart3,
    title: "Tăng tốc tăng trưởng",
    desc: "Đẩy nhanh vòng lặp product–market fit, tối ưu unit economics và kết nối vốn đầu tư.",
  },
  {
    icon: HandshakeIcon,
    title: "Kết nối hệ sinh thái",
    desc: "Mạng lưới 100+ mentor, 50+ nhà đầu tư và cộng đồng 200+ startup alumni trên toàn quốc.",
  },
];

export default async function HomePage() {
  const [
    featuredPrograms,
    featuredStartups,
    featuredMentors,
    upcomingEvents,
    latestArticles,
    stats,
    programCount,
  ] = await Promise.all([
    getPrograms({ featured: true, limit: 3 }),
    getStartups({ featured: true, limit: 6 }),
    getMentors({ featured: true, limit: 4 }),
    getEvents({ upcomingOnly: true, limit: 3 }),
    getArticles({ limit: 3 }),
    getStartupStats(),
    getProgramCount(),
  ]);

  // [S1-5] Fallback khi DB trống (dev/staging)
  const STATS = [
    {
      icon: Rocket,
      value: programCount > 0 ? `${programCount}+` : "15+",
      label: "Chương trình",
    },
    {
      icon: TrendingUp,
      value: stats.total > 0 ? `${stats.total}+` : "200+",
      label: "Startup hỗ trợ",
    },
    {
      icon: Users,
      value: stats.totalTeam > 0 ? `${stats.totalTeam}+` : "800+",
      label: "Thành viên",
    },
    {
      icon: Star,
      value:
        stats.totalFunding >= 1_000_000
          ? `$${(stats.totalFunding / 1_000_000).toFixed(1)}M`
          : stats.totalFunding >= 1000
            ? `$${(stats.totalFunding / 1000).toFixed(0)}K`
            : "$12M+",
      label: "Vốn huy động",
    },
  ];

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          [S2-1] HERO — Layout 2 cột + ảnh Unsplash bên phải
          ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-linear-to-br from-blue-700 via-blue-600 to-blue-800 text-white">
        {/* Background — ảnh sự kiện mới nhất, fallback Unsplash */}
        {/* Background decoration — subtle blobs + dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/10 blur-3xl" />
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <Container className="relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center py-24 lg:py-32">
            {/* ── Text column ── */}
            <div>
              {/* [S1-3] aria-hidden cho decorative pulse dot */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium mb-8">
                <span
                  className="w-2 h-2 rounded-full bg-green-400 animate-pulse"
                  aria-hidden="true"
                />
                Đang nhận hồ sơ chương trình 2025
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Hệ sinh thái khởi nghiệp
                {/* [S1-2] Fix contrast — text-white/90 thay text-blue-200 */}
                <span className="block text-white/85 mt-1">
                  đổi mới sáng tạo
                </span>
              </h1>

              {/* [S1-2] Fix contrast — text-white/75 thay text-blue-100 */}
              <p className="text-white/75 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                SCEI đồng hành cùng startup Việt Nam từ giai đoạn ý tưởng đến
                tăng trưởng — thông qua ươm tạo, tăng tốc và kết nối hệ sinh
                thái đầu tư.
              </p>

              {/* [S1-1] Fix buttons — dùng variant đúng */}
              <div className="flex flex-wrap gap-4">
                <Link href="/programs">
                  <Button
                    size="lg"
                    variant="primary-inverse"
                    className="rounded-full font-bold px-8"
                  >
                    Xem chương trình <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline-inverse"
                    className="rounded-full px-8"
                  >
                    Liên hệ với chúng tôi
                  </Button>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-10 flex items-center gap-6 text-sm text-white/60">
                <span className="flex items-center gap-1.5">
                  <span className="text-green-400 font-bold text-base">✓</span>{" "}
                  Miễn phí tham gia
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-green-400 font-bold text-base">✓</span>{" "}
                  Mentor 1-on-1
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-green-400 font-bold text-base">✓</span>{" "}
                  Kết nối đầu tư
                </span>
              </div>
            </div>

            {/* ── Image column ── */}
            <div className="hidden lg:block relative">
              {/* Main image */}
              <div className="relative h-110 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <Image
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&q=85"
                  alt="Startup team làm việc tại SCEI — thay bằng ảnh thực tế của trung tâm"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 0vw, 50vw"
                />
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-linear-to-t from-blue-900/40 via-transparent to-transparent" />
              </div>

              {/* Floating stat card */}
              <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Startup gọi vốn thành công
                  </p>
                  <p className="text-lg font-extrabold text-gray-900">
                    87% <span className="text-green-500 text-sm">↑ 2024</span>
                  </p>
                </div>
              </div>

              {/* Floating avatar stack */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop",
                    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop",
                  ].map((src, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white"
                    >
                      <Image
                        src={src}
                        alt="Startup founder"
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600 font-medium pr-1">
                  200+ alumni
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          [S2-2] PARTNER LOGO STRIP
          ══════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100 py-8">
        <Container>
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
            Được hỗ trợ bởi các đối tác chiến lược
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200 group"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 group-hover:bg-blue-600 transition-colors shrink-0" />
                <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-800 transition-colors whitespace-nowrap">
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* ══════════════════════════════════════════════════════════
          [S1-4] STATS — semantic dl/dt/dd
          ══════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-gray-100">
        <Container>
          <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex flex-col items-center py-8 px-6 text-center"
              >
                <Icon
                  className="w-6 h-6 text-blue-600 mb-3"
                  aria-hidden="true"
                />
                <dd className="text-3xl font-extrabold text-gray-900 mb-1">
                  {value}
                </dd>
                <dt className="text-sm text-gray-500">{label}</dt>
              </div>
            ))}
          </dl>
        </Container>
      </div>

      {/* ══════════════════════════════════════════════════════════
          [S2-3] ABOUT SECTION — 2 cột text + ảnh
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image side */}
            <div className="relative order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=85"
                  alt="Đội ngũ SCEI trong buổi workshop với startup — thay bằng ảnh thực tế"
                  width={800}
                  height={600}
                  className="object-cover w-full h-auto"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl bg-blue-600/10 -z-10" />
              <div className="absolute -top-4 -left-4 w-20 h-20 rounded-xl bg-indigo-500/10 -z-10" />

              {/* Badge overlay */}
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-xl shadow-lg px-4 py-3">
                <p className="text-xs text-gray-500 font-medium">
                  Thành lập từ năm
                </p>
                <p className="text-2xl font-extrabold text-blue-700">2024</p>
              </div>
            </div>

            {/* Text side */}
            <div className="order-1 lg:order-2">
              <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
                Về chúng tôi
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
                Nơi ý tưởng được
                <br />
                <span className="text-blue-600">nuôi dưỡng và bứt phá</span>
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                SCEI là trung tâm hỗ trợ khởi nghiệp đổi mới sáng tạo trực thuộc
                hệ thống quốc gia, kết nối startup với nguồn lực, kiến thức và
                mạng lưới nhà đầu tư cần thiết để phát triển bền vững tại thị
                trường Việt Nam và khu vực.
              </p>

              {/* Value propositions */}
              <div className="space-y-4 mb-8">
                {VALUES.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon
                        className="w-5 h-5 text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 mb-0.5">{title}</p>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/about">
                <Button variant="primary" className="rounded-full px-6">
                  Tìm hiểu về SCEI <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURED PROGRAMS
          ══════════════════════════════════════════════════════════ */}
      {featuredPrograms.length > 0 && (
        <Section className="py-16 md:py-20 bg-gray-50">
          <Container>
            <SectionHeader
              tag="Chương trình"
              title="Tham gia cùng SCEI"
              desc="Các chương trình ươm tạo và tăng tốc được thiết kế cho từng giai đoạn phát triển của startup."
              href="/programs"
            />
            <div className="grid gap-6 md:grid-cols-3">
              {featuredPrograms.map((p) => {
                const typeInfo = PROGRAM_TYPE_LABEL[p.type] ?? {
                  label: p.type,
                  color: "",
                };
                const isOpen = p.status === "OPEN";
                return (
                  // [S1-5] aria-label cho card link
                  <Link
                    key={p.id}
                    href={`/programs/${p.slug}`}
                    className="group"
                    aria-label={`Xem chương trình ${p.name}`}
                  >
                    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                      {p.cover_image ? (
                        <div className="relative h-44 overflow-hidden">
                          <Image
                            src={p.cover_image}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="h-44 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                          <Rocket
                            className="w-12 h-12 text-blue-300"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeInfo.color}`}
                          >
                            {typeInfo.label}
                          </span>
                          {isOpen && (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                              <span
                                className="w-1.5 h-1.5 rounded-full bg-green-500"
                                aria-hidden="true"
                              />{" "}
                              Đang mở
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                          {p.short_desc}
                        </p>
                        <span className="flex items-center gap-1 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all mt-auto">
                          Tìm hiểu thêm <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </Container>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════════
          FEATURED STARTUPS
          ══════════════════════════════════════════════════════════ */}
      {featuredStartups.length > 0 && (
        <Section className="py-16 md:py-20 bg-white">
          <Container>
            <SectionHeader
              tag="Startup"
              title="Hệ sinh thái của chúng tôi"
              desc="Các startup tiêu biểu đang được ươm tạo và tăng tốc tại SCEI."
              href="/startups"
            />
            <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {featuredStartups.map((s) => (
                <Link
                  key={s.id}
                  href={`/startups/${s.slug}`}
                  className="group"
                  aria-label={`Xem startup ${s.name}`}
                >
                  <Card className="p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    {s.logo ? (
                      <div className="relative w-14 h-14 mb-3 rounded-xl overflow-hidden">
                        <Image
                          src={s.logo}
                          alt={s.name}
                          fill
                          className="object-contain"
                          sizes="56px"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 mb-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-600">
                          {s.name[0]}
                        </span>
                      </div>
                    )}
                    <p className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {STARTUP_STAGE_LABEL[s.stage] ?? s.stage}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════════
          FEATURED MENTORS
          ══════════════════════════════════════════════════════════ */}
      {featuredMentors.length > 0 && (
        <Section className="py-16 md:py-20 bg-gray-50">
          <Container>
            <SectionHeader
              tag="Mentor"
              title="Đội ngũ cố vấn"
              desc="Các chuyên gia giàu kinh nghiệm đồng hành và hỗ trợ trực tiếp cho startup trong hành trình phát triển."
              href="/mentors"
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredMentors.map((m) => (
                <Link
                  key={m.id}
                  href={`/mentors/${m.slug}`}
                  className="group"
                  aria-label={`Xem profile mentor ${m.name}`}
                >
                  <Card className="p-6 text-center hover:shadow-md transition-shadow">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all">
                      {m.avatar ? (
                        <Image
                          src={m.avatar}
                          alt={m.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-2xl font-bold text-gray-400">
                            {m.name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {m.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {m.title}
                    </p>
                    {m.organization && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {m.organization}
                      </p>
                    )}
                    {m.expertise?.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1 mt-3">
                        {m.expertise.slice(0, 2).map((e) => (
                          <span
                            key={e}
                            className="rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs"
                          >
                            {e}
                          </span>
                        ))}
                      </div>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════════
          [S2-4] TESTIMONIALS
          ══════════════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <Container>
          <SectionHeader
            tag="Câu chuyện thành công"
            title="Startup nói gì về SCEI"
            desc="Hơn 200 startup đã trưởng thành cùng chúng tôi. Đây là những gì họ chia sẻ."
          />

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="relative bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow"
              >
                {/* Quote icon */}
                <Quote
                  className="w-8 h-8 text-blue-100 mb-4"
                  aria-hidden="true"
                />

                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 mt-auto">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden ring-2 ring-gray-200 shrink-0">
                    <Image
                      src={t.avatar}
                      alt={`Ảnh ${t.name}`}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">
                      {t.title} · {t.company}
                    </p>
                    <span className="inline-block mt-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      {t.stage}
                    </span>
                  </div>
                </div>

                {/* Accent border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-2xl" />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          UPCOMING EVENTS
          ══════════════════════════════════════════════════════════ */}
      {upcomingEvents.length > 0 && (
        <Section className="py-16 md:py-20 bg-gray-50">
          <Container>
            <SectionHeader
              tag="Sự kiện"
              title="Sắp diễn ra"
              desc="Tham gia các workshop, pitching và networking để mở rộng kết nối trong hệ sinh thái khởi nghiệp."
              href="/events"
            />
            <div className="grid gap-5 md:grid-cols-3">
              {upcomingEvents.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.slug}`}
                  className="group"
                  aria-label={`Xem sự kiện ${ev.title}`}
                >
                  <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                    {/* Ảnh cover — nếu có; fallback gradient theo loại sự kiện */}
                    {ev.cover_image ? (
                      <div className="relative h-40 overflow-hidden shrink-0">
                        <Image
                          src={ev.cover_image}
                          alt={ev.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        {/* Badge type đè lên ảnh */}
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-white/90 backdrop-blur text-blue-700 px-2.5 py-0.5 text-xs font-semibold shadow-sm">
                            {EVENT_TYPE_LABEL[ev.type] ?? ev.type}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="relative h-40 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 overflow-hidden">
                        <CalendarDays
                          className="w-12 h-12 text-white/30"
                          aria-hidden="true"
                        />
                        {/* Badge type trên fallback */}
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-white/20 border border-white/30 text-white px-2.5 py-0.5 text-xs font-semibold">
                            {EVENT_TYPE_LABEL[ev.type] ?? ev.type}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      {/* Location row — chỉ hiện khi KHÔNG có ảnh (badge đã thay thế type rồi) */}
                      {(ev.is_online || ev.location) && (
                        <div className="mb-3">
                          {ev.is_online ? (
                            <span className="text-xs text-gray-400">
                              🌐 Online
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <MapPin
                                className="w-3 h-3 shrink-0"
                                aria-hidden="true"
                              />
                              <span className="truncate">{ev.location}</span>
                            </span>
                          )}
                        </div>
                      )}

                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {ev.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        {ev.short_desc}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
                        <CalendarDays
                          className="w-4 h-4 text-blue-500"
                          aria-hidden="true"
                        />
                        {fmtDate(ev.start_date)}
                        {ev.max_attendees && (
                          <span className="ml-auto text-green-600 font-medium">
                            {ev.max_attendees - (ev.registered_count || 0)} suất
                            còn
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════════
          LATEST ARTICLES
          ══════════════════════════════════════════════════════════ */}
      {latestArticles.length > 0 && (
        <Section className="py-16 md:py-20 bg-white">
          <Container>
            <SectionHeader
              tag="Tin tức"
              title="Góc kiến thức"
              desc="Bài viết, hướng dẫn và câu chuyện khởi nghiệp từ đội ngũ và cộng đồng SCEI."
              href="/news"
            />
            <div className="grid gap-6 md:grid-cols-3">
              {latestArticles.map((a) => (
                <Link
                  key={a.id}
                  href={`/news/${a.slug}`}
                  className="group"
                  aria-label={`Đọc bài viết: ${a.title}`}
                >
                  <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                    {a.cover_image ? (
                      <div className="relative h-44 overflow-hidden">
                        <Image
                          src={a.cover_image}
                          alt={a.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-4xl">📰</span>
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 block">
                        {a.category}
                      </span>
                      <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                        {a.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {a.excerpt}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════════
          CTA FINAL — [S1-1] dùng variant button đúng
          ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-20 md:py-28">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-indigo-400/20 blur-3xl" />
        </div>

        <Container className="relative text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">
            Bắt đầu hành trình
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Sẵn sàng đưa startup lên tầm cao mới?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Nộp đơn tham gia chương trình ươm tạo hoặc liên hệ để được tư vấn
            miễn phí — không ràng buộc.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/programs">
              {/* [S1-1] variant "primary-inverse" */}
              <Button
                size="lg"
                variant="primary-inverse"
                className="rounded-full font-bold px-8"
              >
                Xem chương trình <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              {/* [S1-1] variant "outline-inverse" */}
              <Button
                size="lg"
                variant="outline-inverse"
                className="rounded-full px-8"
              >
                Liên hệ ngay
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

// ── Helper component ───────────────────────────────────────────
function SectionHeader({ tag, title, desc, href }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
          {tag}
        </p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          {title}
        </h2>
        {desc && <p className="text-gray-500 mt-2 max-w-xl">{desc}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:gap-2.5 transition-all whitespace-nowrap"
        >
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
