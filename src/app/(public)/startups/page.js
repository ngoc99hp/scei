"use client"

import Link from "next/link"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Rocket,
  TrendingUp,
  DollarSign,
  Briefcase,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Leaf,
  Plus
} from "lucide-react"

const stats = [
  { label: "Startups năng động", value: "150+", icon: <Rocket className="h-5 w-5" /> },
  { label: "Vốn đã huy động", value: "$10M+", icon: <DollarSign className="h-5 w-5" /> },
  { label: "Việc làm tạo ra", value: "500+", icon: <Briefcase className="h-5 w-5" /> },
  { label: "Tỷ lệ sống sót", value: "85%", icon: <TrendingUp className="h-5 w-5" /> },
]

const startups = [
  {
    name: "FinTech Flow",
    industry: "FinTech",
    desc: "Giải pháp thanh toán số đột phá giúp tối ưu hóa giao dịch cho các doanh nghiệp vừa và nhỏ.",
    status: "Acceleration",
    icon: <DollarSign className="h-8 w-8 text-[#0083c2]" />,
    color: "bg-blue-50",
  },
  {
    name: "EcoGreen AI",
    industry: "Agriculture",
    desc: "Nông nghiệp thông minh sử dụng AI để tối ưu hóa năng suất và giảm thiểu tác động môi trường.",
    status: "Incubation",
    icon: <Leaf className="h-8 w-8 text-green-600" />,
    color: "bg-green-50",
  },
  {
    name: "MediConnect",
    industry: "HealthTech",
    desc: "Hệ sinh thái y tế số kết nối bệnh nhân trực tiếp với các chuyên gia đầu ngành một cách nhanh chóng.",
    status: "Series A",
    icon: <ShieldCheck className="h-8 w-8 text-red-500" />,
    color: "bg-red-50",
  },
  {
    name: "EduQuest",
    industry: "EdTech",
    desc: "Nền tảng học tập cá nhân hóa dựa trên dữ liệu lớn, giúp học sinh phát triển kỹ năng toàn diện.",
    status: "Seed Round",
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    color: "bg-yellow-50",
  },
  {
    name: "LogiSmart",
    industry: "Logistics",
    desc: "Tối ưu hóa chuỗi cung ứng bằng công nghệ IoT, giảm thiểu 30% chi phí vận hành cho doanh nghiệp.",
    status: "Acceleration",
    icon: <Briefcase className="h-8 w-8 text-purple-500" />,
    color: "bg-purple-50",
  },
  {
    name: "RenewHub",
    industry: "Energy",
    desc: "Hệ thống quản lý năng lượng thông minh, thúc đẩy việc sử dụng năng lượng tái tạo trong đô thị.",
    status: "Incubation",
    icon: <Zap className="h-8 w-8 text-orange-500" />,
    color: "bg-orange-50",
  },
]

export default function StartupsPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="relative py-24 overflow-hidden bg-background">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="startup-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#0083c2" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#startup-grid)" />
          </svg>
        </div>

        <Container className="relative z-10 text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 border-[#0083c2] text-[#0083c2] px-4 py-1 rounded-full font-medium">
            Hệ sinh thái SCEI
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.1]">
            Hệ sinh thái <span className="text-[#0083c2]">Startups</span>
          </h1>
          <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
            Nơi hội tụ những ý tưởng đột phá và những nhà sáng lập đầy khao khát, cùng nhau kiến tạo giải pháp cho những thách thức lớn.
          </p>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section className="py-12 border-y border-border bg-muted/30">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-8 bg-background rounded-2xl shadow-sm border border-border/50 text-center group hover:border-[#0083c2]/50 transition-colors">
                <div className="h-14 w-14 rounded-full bg-[#0083c2]/10 flex items-center justify-center text-[#0083c2] mb-4 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Startups Grid */}
      <Section className="py-24">
        <Container>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Startup tiêu biểu</h2>
              <p className="text-muted-foreground mt-2">Khám phá các dự án tiềm năng trong danh mục đầu tư của chúng tôi.</p>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {startups.map((startup, idx) => (
              <Card key={idx} className="group p-8 border border-border bg-background hover:shadow-[0_20px_50px_rgba(0,131,194,0.1)] transition-all duration-300 relative overflow-hidden">
                <div className={`h-16 w-16 rounded-2xl ${startup.color} flex items-center justify-center mb-8`}>
                  {startup.icon}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-muted text-muted-foreground text-[10px] uppercase font-bold tracking-widest px-2">
                    {startup.industry}
                  </Badge>
                  <Badge variant="outline" className="border-[#0083c2]/30 text-[#0083c2] text-[10px] uppercase font-bold tracking-widest px-2">
                    {startup.status}
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4 group-hover:text-[#0083c2] transition-colors">
                  {startup.name}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8 min-h-[5rem]">
                  {startup.desc}
                </p>
                <Link href="#" className="inline-flex items-center gap-2 text-sm font-bold text-[#0083c2] group/link">
                  Xem chi tiết <ExternalLink className="h-4 w-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                </Link>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Custom Section - Why SCEI Startups */}
      <Section className="py-24 bg-[#0083c2]/5">
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
                Tại sao các Startups chọn đồng hành cùng <span className="text-[#0083c2]">SCEI?</span>
              </h2>
              <ul className="space-y-6">
                {[
                  { title: "Mạng lưới cố vấn sâu rộng", desc: "Tiếp cận hơn 80 chuyên gia hàng đầu từ nhiều lĩnh vực." },
                  { title: "Cơ hội gọi vốn", desc: "Kết nối trực tiếp với 100+ nhà đầu tư và quỹ mạo hiểm toàn cầu." },
                  { title: "Không gian sáng tạo", desc: "Sử dụng Co-working Space hiện đại cùng cộng đồng cùng chí hướng." },
                  { title: "Hỗ trợ pháp lý & vận hành", desc: "Đội ngũ chuyên trách hỗ trợ từ khâu thành lập đến IPO." },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#0083c2] flex items-center justify-center text-white mt-1">
                      <Plus className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl skew-y-3">
                <img
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?q=80&w=2070&auto=format&fit=crop"
                  alt="Team collaboration"
                  className="h-full w-full object-cover -skew-y-3"
                />
              </div>
              <div className="absolute -top-10 -right-10 h-40 w-40 bg-[#0083c2]/20 rounded-full blur-3xl -z-10 animate-pulse" />
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-24">
        <Container>
          <div className="relative rounded-[3rem] bg-foreground p-12 lg:p-20 overflow-hidden text-center text-background">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[40px] border-white rounded-full scale-110" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <Badge variant="outline" className="mb-6 border-white/20 text-white/60 px-4 py-1 rounded-full font-medium">
                Submit Your Project
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                Bạn đã sẵn sàng để viết tiếp câu chuyện thành công?
              </h2>
              <p className="text-background/70 text-lg md:text-xl mb-12">
                Hồ sơ ứng tuyển đợt Incubation 2024 đang được mở. Hãy để chúng tôi đồng hành cùng bạn trên con đường khởi nghiệp.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="px-10 h-16 rounded-full font-bold bg-[#0083c2] text-white hover:bg-[#0083c2]/90 border-none transition-all shadow-[0_0_20px_rgba(0,131,194,0.3)]">
                    Nộp hồ sơ ngay <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
