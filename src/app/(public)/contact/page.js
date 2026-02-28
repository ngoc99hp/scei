"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ui/page-header"
import { Mail, Phone, MapPin, Linkedin, Facebook, Send, Building2, UserCircle2, Handshake } from "lucide-react"

const contactFormSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  organization: z.string().optional(),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  subject: z.string().min(1, "Vui lòng chọn chủ đề"),
  message: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
})

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data) => {
    // Mock API call
    console.log("Form data:", data)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.")
    reset()
  }

  return (
    <>
      {/* Hero Section */}
      <Section className="bg-gradient-to-b from-muted/50 to-background py-14">
        <Container>
          <PageHeader
            title="Liên hệ & Hỗ trợ"
            description="Chúng tôi luôn sẵn sàng lắng nghe và đồng hành cùng bạn trên hành trình đổi mới sáng tạo."
          />
        </Container>
      </Section>

      {/* Stakeholder Quick Links */}
      <Section className="py-12 border-y border-border bg-muted/20">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="p-6 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <UserCircle2 size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Dành cho Startups</h3>
                <p className="text-sm text-muted-foreground mt-2">Đăng ký tham gia các chương trình ươm tạo và tăng tốc.</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">Đăng ký ngay</Button>
            </Card>

            <Card className="p-6 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Handshake size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Dành cho Mentors</h3>
                <p className="text-sm text-muted-foreground mt-2">Chia sẻ kinh nghiệm và dẫn dắt thế hệ khởi nghiệp mới.</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">Trở thành Mentor</Button>
            </Card>

            <Card className="p-6 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-primary/10 rounded-full text-primary">
                <Building2 size={32} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Dành cho Đối tác</h3>
                <p className="text-sm text-muted-foreground mt-2">Hợp tác xây dựng và phát triển hệ sinh thái sáng tạo.</p>
              </div>
              <Button variant="outline" size="sm" className="w-full">Liên hệ hợp tác</Button>
            </Card>
          </div>
        </Container>
      </Section>

      {/* Main Contact Section (Split Layout) */}
      <Section className="py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Left Column: Form */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold">Gửi lời nhắn</h2>
                <p className="text-muted-foreground mt-2">Điền thông tin dưới đây để đội ngũ SCEI hỗ trợ bạn tốt nhất.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên</Label>
                    <Input id="fullName" placeholder="Nguyễn Văn A" {...register("fullName")} />
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organization">Tổ chức / Công ty</Label>
                    <Input id="organization" placeholder="SCEI" {...register("organization")} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="example@scei.vn" {...register("email")} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <Input id="phone" placeholder="028 XXXX XXXX" {...register("phone")} />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Chủ đề</Label>
                  <select
                    id="subject"
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register("subject")}
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="hop-tac">Hợp tác chiến lược</option>
                    <option value="uom-tao">Tham gia chương trình ươm tạo</option>
                    <option value="ho-tro">Hỗ trợ kỹ thuật</option>
                    <option value="khac">Khác</option>
                  </select>
                  {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Nội dung</Label>
                  <Textarea id="message" placeholder="Nhập tin nhắn của bạn..." className="min-h-[150px]" {...register("message")} />
                  {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
                </div>

                <Button type="submit" size="lg" className="w-full sm:w-auto px-8" disabled={isSubmitting}>
                  {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>

            {/* Right Column: Info Cards & Map */}
            <div className="space-y-8">
              <div className="grid gap-6">
                <Card className="p-6 flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Địa chỉ văn phòng</h4>
                    <p className="text-sm text-muted-foreground mt-1">Tầng 4, Tòa nhà Innovation, Khu Công nghệ cao, TP. Hồ Chí Minh</p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Hotline</h4>
                    <p className="text-sm text-muted-foreground mt-1">+84 28 1234 5678</p>
                    <p className="text-xs text-muted-foreground">(Thứ 2 - Thứ 6: 8:00 - 17:30)</p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold">Email hỗ trợ</h4>
                    <p className="text-sm text-muted-foreground mt-1">contact@scei.com.vn</p>
                  </div>
                </Card>
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                <Button variant="outline" size="icon" className="rounded-full">
                  <Linkedin size={20} />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Facebook size={20} />
                </Button>
              </div>

              {/* Map Placeholder */}
              <div className="h-[300px] w-full rounded-xl bg-muted animate-pulse flex items-center justify-center border border-border overflow-hidden">
                <div className="text-center p-6">
                  <MapPin className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-2" />
                  <p className="text-sm text-muted-foreground">Google Maps Integration Placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
