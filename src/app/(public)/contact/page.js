// src/app/(public)/contact/page.js
//
// ✅ FIX Critical #5 — Loại bỏ duplicate form implementation
//
//    TRƯỚC (BUG): Page này tự implement form logic với useState, handleSubmit,
//    song song với src/components/forms/contact-form.jsx đã làm đúng việc đó.
//    → Hai implementation diverge theo thời gian, bug fix ở 1 nơi không áp dụng cho nơi kia.
//    → "use client" cho toàn page làm mất Server Component benefits (hero section static).
//
//    SAU (FIX):
//    - Page là Server Component (không có "use client")
//    - Static parts (hero, info cards) render server-side → nhanh hơn
//    - Form logic delegate hoàn toàn cho <ContactForm /> client component

import ContactForm from "@/components/forms/contact-form"

// Metadata cho SEO
export const metadata = {
  title: "Liên hệ — SCEI",
  description: "Liên hệ với SCEI để được tư vấn về chương trình khởi nghiệp, hợp tác và các dịch vụ hỗ trợ startup.",
}

const INFO_CARDS = [
  { icon: "📍", label: "Địa chỉ", value: "Số 36, đường Dân lập, phường Lê Chân, thành phố Hải Phòng" },
  { icon: "📞", label: "Điện thoại", value: "0989 320 383" },
  { icon: "✉️", label: "Email", value: "hpu@hpu.edu.vn" },
]

// ✅ Không có "use client" — đây là Server Component
export default function ContactPage() {
  return (
    <main className="min-h-screen py-16 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto">

        {/* Header — static, render server-side */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên hệ</h1>
          <p className="text-gray-600">
            Chúng tôi luôn sẵn sàng lắng nghe. Hãy gửi câu hỏi hoặc yêu cầu của bạn.
          </p>
        </div>

        {/* Contact Info Cards — static, render server-side */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {INFO_CARDS.map((info) => (
            <div
              key={info.label}
              className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-2" aria-hidden="true">
                {info.icon}
              </div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">
                {info.label}
              </p>
              <p className="text-sm text-gray-700">{info.value}</p>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/*
            ✅ FIX — Dùng ContactForm component thay vì implement lại
            ContactForm đã có:
            - Honeypot anti-spam
            - Zod validation
            - Error handling từ API
            - Success state
            - Loading state
          */}
          <ContactForm />
        </div>

      </div>
    </main>
  )
}