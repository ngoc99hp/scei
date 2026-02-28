"use client"

import Link from "next/link"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Award,
  Globe,
  Handshake,
  Mail,
  Linkedin,
  ArrowRight
} from "lucide-react"

const stats = [
  { label: "Cố vấn chuyên gia", value: "80+", icon: <Users className="h-5 w-5" /> },
  { label: "Đối tác chiến lược", value: "100+", icon: <Globe className="h-5 w-5" /> },
  { label: "Năm kinh nghiệm", value: "15+", icon: <Award className="h-5 w-5" /> },
  { label: "Startups hỗ trợ", value: "150+", icon: <Handshake className="h-5 w-5" /> },
]

const mentors = [
  {
    name: "Dr. Minh Tran",
    expertise: "Business Strategy",
    bio: "Hơn 20 năm kinh nghiệm tư vấn chiến lược cho các tập đoàn đa quốc gia và startup công nghệ.",
    image: "https://i.pravatar.cc/150?u=minh",
  },
  {
    name: "Ms. Elena Le",
    expertise: "Marketing & Growth",
    bio: "Chuyên gia tăng trưởng với bề dày thành tích trong việc xây dựng thương hiệu và scaling người dùng.",
    image: "https://i.pravatar.cc/150?u=elena",
  },
  {
    name: "Alex Nguyen",
    expertise: "Product Development",
    bio: "Kỹ sư phần mềm kỳ cựu, từng dẫn dắt các đội ngũ sản phẩm tại Silicon Valley.",
    image: "https://i.pravatar.cc/150?u=alex",
  },
  {
    name: "Prof. Sarah Pham",
    expertise: "Investment & Finance",
    bio: "Chuyên gia tài chính với mạng lưới kết nối sâu rộng trong giới đầu tư thiên thần và quỹ mạo hiểm.",
    image: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    name: "James Vu",
    expertise: "Legal & Compliance",
    bio: "Tư vấn pháp lý chuyên sâu về sở hữu trí tuệ và các thủ tục gọi vốn cho startup.",
    image: "https://i.pravatar.cc/150?u=james",
  },
  {
    name: "Thao Nguyen",
    expertise: "Operations & HR",
    bio: "Xây dựng văn hóa doanh nghiệp và quy trình vận hành linh hoạt cho các tổ chức đang phát triển nóng.",
    image: "https://i.pravatar.cc/150?u=thao",
  },
]

export default function MentorsPage() {
  return (
    <>
      {/* Hero Section */}
      <Section className="relative py-24 overflow-hidden bg-background">
        <div className="absolute inset-0 z-0 opacity-[0.03]">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#0083c2" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <Container className="relative z-10 text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 border-[#0083c2] text-[#0083c2] px-4 py-1 rounded-full font-medium">
            Mạng lưới chuyên gia
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.1]">
            Đội ngũ <span className="text-[#0083c2]">Cố vấn</span>
          </h1>
          <p className="mt-8 text-xl text-muted-foreground leading-relaxed">
            Được dẫn dắt bởi những chuyên gia hàng đầu, những người luôn sẵn sàng chia sẻ kiến thức và kinh nghiệm để giúp bạn kiến tạo giá trị tương lai.
          </p>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section className="py-12 border-y border-border bg-muted/30">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-4 p-6 bg-background rounded-2xl shadow-sm border border-border/50">
                <div className="h-12 w-12 rounded-xl bg-[#0083c2]/10 flex items-center justify-center text-[#0083c2]">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Mentors Grid */}
      <Section className="py-24">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor, idx) => (
              <Card key={idx} className="group overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 bg-background">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={mentor.image}
                    alt={mentor.name}
                    className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="flex gap-4">
                      <Button size="icon" variant="outline" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-[#0083c2] hover:border-[#0083c2]">
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="rounded-full bg-white/10 border-white/20 text-white hover:bg-[#0083c2] hover:border-[#0083c2]">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <Badge className="bg-[#0083c2]/10 text-[#0083c2] border-none mb-4 hover:bg-[#0083c2]/20">
                    {mentor.expertise}
                  </Badge>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-[#0083c2] transition-colors">
                    {mentor.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {mentor.bio}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-20 bg-muted/30">
        <Container>
          <div className="relative rounded-[2.5rem] bg-[#0083c2] p-12 lg:px-20 lg:py-16 overflow-hidden text-white flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 h-96 w-96 bg-white/10 rounded-full blur-3xl text-primary" />

            <div className="relative z-10 max-w-xl text-center lg:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Gia nhập mạng lưới <br /> Cố vấn của SCEI
              </h2>
              <p className="text-white/80 text-lg mb-0 leading-relaxed">
                Bạn có đam mê chia sẻ kiến thức và muốn đóng góp cho sự phát triển của hệ sinh thái khởi nghiệp Việt Nam? Hãy đồng hành cùng chúng tôi.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button size="lg" className="px-10 h-14 rounded-full font-bold bg-white text-[#0083c2] hover:bg-white/90 border-none transition-all shadow-lg group">
                  Đăng ký ngay <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
