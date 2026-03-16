// src/app/(public)/about/page.js
//
// ✅ PERF FIX 2 — Đổi tất cả <img> sang <next/image>:
//    - Tự động lazy loading (không load ảnh ngoài viewport)
//    - Tự động convert sang WebP/AVIF
//    - Tự động responsive srcset
//    - Tránh Cumulative Layout Shift (CLS) nhờ width/height placeholder
//
// So sánh:
//   <img src="...">          → 800KB JPEG, no lazy, CLS
//   <Image src="..." ...>    → 120KB WebP, lazy, no CLS

import Image from "next/image"
import Link from "next/link"

export const metadata = {
  title: "Về chúng tôi",
  description:
    "SCEI là trung tâm hỗ trợ khởi nghiệp đổi mới sáng tạo, kết nối startup với nhà đầu tư và mentor hàng đầu Việt Nam.",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/about` },
}

const TEAM_MEMBERS = [
  {
    name:  "Nguyễn Văn A",
    title: "Giám đốc",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=face",
    bio:   "10 năm kinh nghiệm trong hệ sinh thái khởi nghiệp.",
  },
  {
    name:  "Trần Thị B",
    title: "Phó Giám đốc",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&h=256&fit=crop&crop=face",
    bio:   "Chuyên gia về đầu tư mạo hiểm và tăng tốc startup.",
  },
  {
    name:  "Lê Văn C",
    title: "Trưởng phòng Chương trình",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=face",
    bio:   "Thiết kế và vận hành các chương trình hỗ trợ startup.",
  },
]

const STATS = [
  { label: "Startup được hỗ trợ",   value: "200+"  },
  { label: "Chương trình triển khai", value: "50+"   },
  { label: "Mentor & Chuyên gia",    value: "100+"  },
  { label: "Năm hoạt động",          value: "8"     },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen">

      {/* Hero section */}
      <section className="relative bg-muted/30 py-24 px-4 overflow-hidden border-b border-border">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop"
            alt="About Background"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Về <span className="text-primary italic">SCEI</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
            Chúng tôi xây dựng hệ sinh thái khởi nghiệp đổi mới sáng tạo, kết nối startup
            với nguồn lực, kiến thức và mạng lưới cần thiết để phát triển bền vững.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
          <div className="space-y-5">
            <h2 className="text-3xl font-bold text-foreground">Sứ mệnh của chúng tôi</h2>
            <p className="text-muted-foreground leading-relaxed">
              SCEI tin rằng mỗi ý tưởng đổi mới sáng tạo đều xứng đáng được nuôi dưỡng.
              Chúng tôi tạo ra môi trường nơi startup có thể thất bại an toàn, học nhanh
              và tăng trưởng bền vững.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Thông qua các chương trình ươm tạo, tăng tốc và kết nối, chúng tôi đã hỗ trợ
              hơn 200 startup Việt Nam từ giai đoạn ý tưởng đến gọi vốn thành công.
            </p>
            <Link
              href="/programs"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Xem các chương trình →
            </Link>
          </div>

          {/* ✅ PERF FIX — next/image thay thế <img> */}
          <div className="relative aspect-video rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=675&fit=crop"
              alt="Đội ngũ SCEI trong buổi workshop với các startup"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              // Không cần priority — below the fold
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
                <p className="text-sm text-primary-foreground/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Đội ngũ lãnh đạo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map(member => (
              <div key={member.name} className="text-center group">
                {/* ✅ PERF FIX — next/image: lazy load + WebP + no CLS */}
                <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all">
                  <Image
                    src={member.image}
                    alt={`Ảnh chân dung ${member.name}, ${member.title} tại SCEI`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-primary font-medium mb-2">{member.title}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}