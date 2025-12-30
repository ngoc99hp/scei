import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"

export default function AboutPage() {
  return (
    <>
      {/* Page Header */}
      <Section className="py-12 bg-background">
        <Container>
          <PageHeader
            title="Về SCEI"
            description="Trung tâm Khởi nghiệp Đổi mới Sáng tạo"
          />
        </Container>
      </Section>

      {/* 1. Giới thiệu chung */}
      <Section className="bg-background">
        <Container>
          <div className="mx-auto max-w-3xl">
            <p className="text-lg leading-relaxed text-foreground">
              SCEI là trung tâm khởi nghiệp đổi mới sáng tạo hàng đầu tại Việt Nam, 
              cung cấp hệ sinh thái toàn diện để hỗ trợ các startup từ ý tưởng ban đầu 
              cho đến khi phát triển bền vững. Chúng tôi kết nối doanh nghiệp khởi nghiệp 
              với mentor, nhà đầu tư, đối tác chiến lược và các nguồn lực cần thiết.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Với sứ mệnh thúc đẩy tinh thần khởi nghiệp và đổi mới sáng tạo, 
              SCEI cam kết xây dựng một cộng đồng startup năng động, 
              nơi mọi ý tưởng đều có cơ hội trở thành hiện thực.
            </p>
          </div>
        </Container>
      </Section>

      {/* 2. Tầm nhìn & Sứ mệnh */}
      <Section className="bg-muted/30">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">Tầm nhìn</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Trở thành trung tâm khởi nghiệp đổi mới sáng tạo hàng đầu khu vực, 
                nơi ươm mầm những ý tưởng đột phá và kiến tạo thế hệ doanh nghiệp 
                công nghệ tiên phong, đóng góp tích cực vào sự phát triển bền vững 
                của nền kinh tế số Việt Nam.
              </p>
            </Card>

            <Card className="p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-foreground">Sứ mệnh</h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Cung cấp hệ sinh thái toàn diện và chất lượng cao để hỗ trợ startup 
                Việt Nam phát triển bền vững. Kết nối, đào tạo và trao quyền cho 
                các nhà sáng lập trẻ, giúp họ biến ý tưởng thành sản phẩm, 
                dịch vụ có giá trị thực tiễn cho xã hội.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 3. Dịch vụ / Chương trình */}
      <Section className="bg-background">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Chương trình hỗ trợ
            </h2>
            <p className="mt-4 text-muted-foreground">
              Các giải pháp toàn diện cho mọi giai đoạn phát triển
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Ươm tạo khởi nghiệp
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Hỗ trợ toàn diện từ ý tưởng đến sản phẩm MVP, 
                bao gồm mentorship, đào tạo kỹ năng và tài nguyên khởi nghiệp.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Tăng tốc đổi mới sáng tạo
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Chương trình tăng tốc chuyên sâu giúp startup mở rộng quy mô, 
                tiếp cận thị trường và kết nối với nhà đầu tư.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10">
                <span className="text-3xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Không gian làm việc chung
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Môi trường làm việc hiện đại, đầy đủ tiện nghi và cơ hội networking 
                với cộng đồng startup năng động.
              </p>
            </Card>
          </div>
        </Container>
      </Section>

      {/* 4. Đội ngũ lãnh đạo */}
      <Section className="bg-muted/30">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Đội ngũ lãnh đạo
            </h2>
            <p className="mt-4 text-muted-foreground">
              Những người dẫn dắt hệ sinh thái khởi nghiệp
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Nguyễn Văn A",
                role: "Giám đốc Trung tâm",
              },
              {
                name: "Trần Thị B",
                role: "Phó Giám đốc",
              },
              {
                name: "Lê Văn C",
                role: "Cố vấn Chuyên môn",
              },
              {
                name: "Phạm Thị D",
                role: "Cố vấn Chuyên môn",
              },
            ].map((member, idx) => (
              <Card key={idx} className="overflow-hidden">
                <div className="aspect-square bg-muted">
                  <img
                    src="https://placehold.co/300x300/e5e7eb/6b7280?text=SCEI"
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h4 className="font-semibold text-foreground">{member.name}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* 5. Đối tác */}
      <Section className="bg-background">
        <Container>
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Đối tác chiến lược
            </h2>
            <p className="mt-4 text-muted-foreground">
              Hợp tác cùng các tổ chức hàng đầu
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              "Đối tác A",
              "Đối tác B",
              "Đối tác C",
              "Đối tác D",
              "Đối tác E",
              "Đối tác F",
              "Đối tác G",
              "Đối tác H",
            ].map((partner, idx) => (
              <div
                key={idx}
                className="flex items-center justify-center rounded-lg border border-border bg-card p-8 transition-colors hover:bg-accent"
              >
                <img
                  src={`https://placehold.co/160x80/f3f4f6/9ca3af?text=${encodeURIComponent(partner)}`}
                  alt={partner}
                  className="h-auto w-full object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 6. CTA cuối trang */}
      <Section className="bg-primary text-primary-foreground">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">Đồng hành cùng SCEI</h2>
            <p className="mt-4 text-lg text-primary-foreground/90">
              Hãy để chúng tôi hỗ trợ bạn xây dựng và phát triển startup. 
              Liên hệ ngay để khám phá cơ hội hợp tác.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8"
              asChild
            >
              <a href="/contact">Liên hệ hợp tác</a>
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}