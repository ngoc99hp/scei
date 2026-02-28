"use client"

import Link from "next/link"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import {
  Target,
  Rocket,
  Users,
  Lightbulb,
  Globe,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowRight
} from "lucide-react"

const programs = [
  {
    title: "Ươm tạo khởi nghiệp",
    desc: "Hỗ trợ các ý tưởng sơ khai từ giai đoạn hình thành mô hình kinh doanh đến khi có sản phẩm mẫu (MVP).",
    icon: <Lightbulb className="h-6 w-6" />,
  },
  {
    title: "Tăng tốc doanh nghiệp",
    desc: "Chương trình chuyên sâu giúp doanh nghiệp tối ưu quy trình và bứt phá về doanh thu trong thời gian ngắn.",
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    title: "Kết nối cộng đồng",
    desc: "Kết nối mạng lưới chuyên gia, nhà đầu tư và các startup cùng chí hướng để tạo nên sức mạnh tổng hợp.",
    icon: <Users className="h-6 w-6" />,
  },
]

const team = [
  {
    name: "Nguyễn Văn A",
    role: "Giám đốc Điều hành",
    image: "https://i.pravatar.cc/150?u=a",
  },
  {
    name: "Trần Thị B",
    role: "Giám đốc Chiến lược",
    image: "https://i.pravatar.cc/150?u=b",
  },
  {
    name: "Lê Văn C",
    role: "Giám đốc Công nghệ",
    image: "https://i.pravatar.cc/150?u=c",
  },
  {
    name: "Phạm Thị D",
    role: "Trưởng bộ phận Ươm tạo",
    image: "https://i.pravatar.cc/150?u=d",
  },
]

export default function AboutPage() {
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

        <Container className="relative z-10">
          <div className="max-w-4xl">
            <Badge variant="outline" className="mb-6 border-[#0083c2] text-[#0083c2] px-4 py-1 rounded-full font-medium">
              Về SCEI
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.1]">
              Trung tâm Khởi nghiệp <br />
              <span className="text-[#0083c2]">Đổi mới Sáng tạo</span>
            </h1>
            <p className="mt-8 text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Thúc đẩy hệ sinh thái khởi nghiệp sáng tạo và kết nối nguồn lực phát triển doanh nghiệp tại Việt Nam thông qua các giải pháp đột phá.
            </p>
          </div>
        </Container>
      </Section>

      {/* Introduction */}
      <Section className="py-16 border-t border-border">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Kiến tạo tương lai cho <br /> doanh nghiệp Việt
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  SCEI là đơn vị tiên phong trong việc hỗ trợ các startup vượt qua rào cản ban đầu và vươn tầm quốc tế thông qua các nguồn lực chuyên sâu. Chúng tôi tin rằng đổi mới sáng tạo là chìa khóa để giải quyết các thách thức của thời đại.
                </p>
                <p>
                  Với mạng lưới đối tác toàn cầu và đội ngũ cố vấn giàu kinh nghiệm, SCEI không chỉ cung cấp không gian làm việc mà còn là một bệ phóng chiến lược for mọi ý tưởng tiềm năng.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                  alt="Innovation team"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-[#0083c2]/10 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Vision & Mission */}
      <Section className="py-20 bg-muted/30">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="p-10 border-none shadow-xl bg-background group hover:shadow-2xl transition-all duration-300">
              <div className="h-14 w-14 rounded-2xl bg-[#0083c2]/10 flex items-center justify-center text-[#0083c2] mb-8 group-hover:bg-[#0083c2] group-hover:text-white transition-colors duration-300">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Tầm nhìn</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Trở thành trung tâm hỗ trợ khởi nghiệp hàng đầu khu vực Đông Nam Á, là cầu nối vững chắc giữa ý tưởng và thị trường toàn cầu, định hình tương lai của nền kinh tế số.
              </p>
            </Card>

            <Card className="p-10 border-none shadow-xl bg-background group hover:shadow-2xl transition-all duration-300">
              <div className="h-14 w-14 rounded-2xl bg-[#0083c2]/10 flex items-center justify-center text-[#0083c2] mb-8 group-hover:bg-[#0083c2] group-hover:text-white transition-colors duration-300">
                <Rocket className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Sứ mệnh</h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Kiến tạo môi trường thuận lợi, cung cấp kiến thức thực chiến và kết nối mạng lưới chuyên gia toàn cầu để đồng hành cùng startup trong hành trình chinh phục thành công.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Program */}
      <Section className="py-24">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Chương trình của chúng tôi</h2>
            <p className="text-muted-foreground text-lg">
              Các giải pháp đa dạng được thiết kế riêng cho từng giai đoạn phát triển của doanh nghiệp.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {programs.map((item, idx) => (
              <Card key={idx} className="p-8 border border-border bg-background hover:border-[#0083c2]/50 hover:shadow-lg transition-all group">
                <div className="mb-6 text-[#0083c2] group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {item.desc}
                </p>
                <Button variant="ghost" className="p-0 text-[#0083c2] hover:bg-transparent font-bold flex items-center gap-2 group/btn">
                  Tìm hiểu thêm <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Team Section */}
      <Section className="py-24 bg-[#0083c2]/5">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Đội ngũ lãnh đạo</h2>
            <p className="text-muted-foreground text-lg">
              Những chuyên gia tâm huyết dẫn dắt sứ mệnh tại SCEI.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, idx) => (
              <div key={idx} className="group text-center">
                <div className="relative mx-auto h-48 w-48 mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-[#0083c2] scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300 shadow-lg"
                  />
                </div>
                <h4 className="text-xl font-bold text-foreground">{member.name}</h4>
                <p className="text-[#0083c2] font-medium mt-1 uppercase text-xs tracking-widest">{member.role}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Partners Section */}
      <Section className="py-20 border-t border-border">
        <Container>
          <div className="text-center mb-12">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-50">Đối tác tin cậy</h3>
          </div>
          <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-6 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="flex justify-center">
                <div className="h-12 w-32 bg-muted rounded flex items-center justify-center font-bold text-xs">LOGO {idx + 1}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section className="py-20">
        <Container>
          <div className="relative rounded-[2.5rem] bg-[#0083c2] p-12 lg:p-20 overflow-hidden text-center text-white">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 h-96 w-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 h-96 w-96 bg-black/10 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                Bạn đã sẵn sàng để bứt phá ý tưởng?
              </h2>
              <p className="text-white/80 text-lg md:text-xl mb-12">
                Đừng ngần ngại liên hệ với chúng tôi để bắt đầu hành trình khởi nghiệp chuyên nghiệp ngay hôm nay.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="px-10 h-14 rounded-full font-bold bg-white text-[#0083c2] hover:bg-white/90 border-none transition-all shadow-lg">
                    Đồng hành cùng SCEI
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="px-10 h-14 rounded-full font-bold border-white/40 text-white bg-transparent hover:bg-white/10 hover:border-white transition-all">
                  Tìm hiểu thêm
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
