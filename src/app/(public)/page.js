import Link from "next/link"
import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Xây dựng startup của bạn cùng{" "}
              <span className="text-primary">SCEI</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Nền tảng kết nối hệ sinh thái khởi nghiệp - Từ ý tưởng đến thành công
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/programs">Đăng ký chương trình</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Tìm hiểu thêm</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 py-12">
        <Container>
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">150+</div>
              <div className="mt-2 text-sm text-muted-foreground">Startups</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">80+</div>
              <div className="mt-2 text-sm text-muted-foreground">Mentors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">200+</div>
              <div className="mt-2 text-sm text-muted-foreground">Sự kiện</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">$5M+</div>
              <div className="mt-2 text-sm text-muted-foreground">Vốn huy động</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Programs Section */}
      <section className="py-20">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Chương trình của chúng tôi</h2>
            <p className="mt-4 text-muted-foreground">
              Lựa chọn chương trình phù hợp với giai đoạn phát triển của bạn
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Card className="p-6">
              <h3 className="text-xl font-semibold">Incubation</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Hỗ trợ từ ý tưởng đến sản phẩm MVP
              </p>
              <Button className="mt-6" variant="outline" asChild>
                <Link href="/programs">Tìm hiểu thêm</Link>
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold">Acceleration</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tăng tốc tăng trưởng và mở rộng thị trường
              </p>
              <Button className="mt-6" variant="outline" asChild>
                <Link href="/programs">Tìm hiểu thêm</Link>
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold">Co-working</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Không gian làm việc chung và networking
              </p>
              <Button className="mt-6" variant="outline" asChild>
                <Link href="/programs">Tìm hiểu thêm</Link>
              </Button>
            </Card>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold">Sẵn sàng bắt đầu?</h2>
            <p className="mt-4 text-primary-foreground/90">
              Đăng ký ngay để nhận hỗ trợ từ SCEI
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="mt-8"
              asChild
            >
              <Link href="/programs">Đăng ký ngay</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}