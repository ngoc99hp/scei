// src/app/(public)/contact/page.js
import { Container } from "@/components/ui/container"
import { Section } from "@/components/ui/section"
import ContactForm from "@/components/forms/contact-form"
import { MapPin, Phone, Mail, Clock, Facebook, Linkedin } from "lucide-react"

export const metadata = {
  title: "Liên hệ — SCEI",
  description: "Liên hệ với Trung tâm Hỗ trợ Khởi nghiệp Đổi mới Sáng tạo SCEI để được tư vấn và hỗ trợ.",
}

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Địa chỉ",
    value: "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
  },
  {
    icon: Phone,
    label: "Điện thoại",
    value: "(028) 3823 4567",
    href: "tel:02838234567",
  },
  {
    icon: Mail,
    label: "Email",
    value: "info@scei.vn",
    href: "mailto:info@scei.vn",
  },
  {
    icon: Clock,
    label: "Giờ làm việc",
    value: "Thứ 2 – Thứ 6: 8:00 – 17:30",
  },
]

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white py-16 md:py-24">
        <Container>
          <div className="max-w-2xl">
            <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-3">Liên hệ</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Kết nối với chúng tôi</h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Dù bạn đang tìm kiếm hỗ trợ khởi nghiệp, cơ hội hợp tác hay chỉ muốn tìm hiểu thêm —
              đội ngũ SCEI luôn sẵn sàng lắng nghe.
            </p>
          </div>
        </Container>
      </div>

      <Section className="py-16 md:py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-5">

            {/* Form — chiếm 3/5 */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold mb-2">Gửi yêu cầu cho chúng tôi</h2>
              <p className="text-gray-500 text-sm mb-8">
                Điền thông tin bên dưới, chúng tôi sẽ phản hồi trong vòng <strong>1–2 ngày làm việc</strong>.
              </p>
              <ContactForm />
            </div>

            {/* Thông tin liên hệ — chiếm 2/5 */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Thông tin liên hệ</h2>
                <ul className="space-y-5">
                  {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                    <li key={label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
                        {href ? (
                          <a href={href} className="text-gray-800 font-medium hover:text-blue-600 transition-colors">
                            {value}
                          </a>
                        ) : (
                          <p className="text-gray-800 font-medium">{value}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mạng xã hội */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Theo dõi chúng tôi</p>
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com/scei.vn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    aria-label="Facebook SCEI"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com/company/scei-vn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center justify-center transition-colors"
                    aria-label="LinkedIn SCEI"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Bản đồ nhúng */}
              <div className="rounded-2xl overflow-hidden border border-gray-200 h-56">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4499!2d106.7008!3d10.7769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzM2LjkiTiAxMDbCsDQyJzAyLjkiRQ!5e0!3m2!1svi!2svn!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Bản đồ SCEI"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}