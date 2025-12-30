import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"

export default function AboutPage() {
  return (
    <>
      {/* ==================================================
          PAGE HEADER
          ================================================== */}
      <Section className="py-14 bg-background">
        <Container>
          <PageHeader
            title="Về SCEI"
            description="Trung tâm Khởi nghiệp Đổi mới Sáng tạo – nơi kết nối ý tưởng, con người và nguồn lực"
          />
        </Container>
      </Section>

      {/* ==================================================
          INTRODUCTION – WHO WE ARE
          ================================================== */}
      <Section>
        <Container>
          <div className="mx-auto max-w-3xl space-y-6 text-lg leading-relaxed">
            <p>
              <strong>SCEI (Supporting Center for Entrepreneurship Innovation)</strong> 
              là trung tâm hỗ trợ khởi nghiệp đổi mới sáng tạo, tập trung xây dựng 
              hệ sinh thái toàn diện cho startup, sinh viên và doanh nghiệp trẻ tại Việt Nam.
            </p>

            <p className="text-muted-foreground">
              Chúng tôi không chỉ cung cấp chương trình ươm tạo hay tăng tốc, 
              mà còn đóng vai trò là cầu nối giữa <strong>ý tưởng – con người – nguồn lực</strong>, 
              giúp các dự án khởi nghiệp phát triển bền vững và tạo ra giá trị thực tiễn cho xã hội.
            </p>
          </div>
        </Container>
      </Section>

      {/* ==================================================
          VISION & MISSION
          ================================================== */}
      <Section className="bg-muted/30">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="p-8">
              <h3 className="text-2xl font-bold">Tầm nhìn</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Trở thành trung tâm khởi nghiệp đổi mới sáng tạo uy tín tại Việt Nam,
                nơi ươm mầm những ý tưởng đột phá và góp phần hình thành thế hệ
                doanh nghiệp công nghệ tiên phong.
              </p>
            </Card>

            <Card className="p-8">
              <h3 className="text-2xl font-bold">Sứ mệnh</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Hỗ trợ các nhà sáng lập trẻ thông qua đào tạo, cố vấn,
                kết nối nguồn lực và cộng đồng, giúp họ biến ý tưởng thành
                sản phẩm và dịch vụ có giá trị thực tiễn.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* ==================================================
          PROGRAMS & SERVICES
          ================================================== */}
      <Section>
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Chương trình & Hoạt động</h2>
            <p className="mt-4 text-muted-foreground">
              Đồng hành cùng startup ở mọi giai đoạn phát triển
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Ươm tạo khởi nghiệp",
                desc: "Hỗ trợ startup giai đoạn đầu xây dựng MVP, hoàn thiện mô hình kinh doanh và định hướng phát triển."
              },
              {
                title: "Tăng tốc đổi mới sáng tạo",
                desc: "Chương trình chuyên sâu giúp startup mở rộng quy mô, tiếp cận thị trường và kết nối nhà đầu tư."
              },
              {
                title: "Không gian & cộng đồng",
                desc: "Cung cấp môi trường làm việc, học tập và kết nối trong cộng đồng khởi nghiệp năng động."
              },
            ].map((item, idx) => (
              <Card key={idx} className="p-6">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ==================================================
          LEADERSHIP TEAM
          ================================================== */}
      <Section className="bg-muted/30">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Đội ngũ lãnh đạo & cố vấn</h2>
            <p className="mt-4 text-muted-foreground">
              Những người đồng hành và dẫn dắt hệ sinh thái SCEI
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: "Nguyễn Văn A", role: "Giám đốc Trung tâm" },
              { name: "Trần Thị B", role: "Phó Giám đốc" },
              { name: "Lê Văn C", role: "Cố vấn Chuyên môn" },
              { name: "Phạm Thị D", role: "Cố vấn Chuyên môn" },
            ].map((member, idx) => (
              <Card key={idx} className="overflow-hidden text-center">
                <div className="aspect-square bg-muted" />
                <div className="p-6">
                  <h4 className="font-semibold">{member.name}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {member.role}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ==================================================
          PARTNERS
          ================================================== */}
      <Section>
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Đối tác & Hệ sinh thái</h2>
            <p className="mt-4 text-muted-foreground">
              Đồng hành cùng các tổ chức, doanh nghiệp và trường đại học
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center rounded-lg border bg-card p-8 text-sm text-muted-foreground"
              >
                Logo đối tác
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ==================================================
          CTA
          ================================================== */}
      <Section className="bg-primary text-primary-foreground">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Đồng hành cùng SCEI</h2>
            <p className="mt-4 text-lg text-primary-foreground/90">
              Bạn đang tìm kiếm môi trường để phát triển ý tưởng khởi nghiệp?
              Hãy kết nối với chúng tôi ngay hôm nay.
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <a href="/contact">Liên hệ hợp tác</a>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
