// src/lib/validations.js
// Zod schemas dùng chung cho cả client form và server API
// Convention: camelCase keys khớp với form admin

import { z } from "zod"

// ── Helpers ──────────────────────────────────────────────────

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// ── Contact Form ─────────────────────────────────────────────

export const contactSchema = z.object({
  fullName:     z.string().min(2, "Họ tên tối thiểu 2 ký tự").max(100),
  organization: z.string().max(200).optional().or(z.literal("")),
  email:        z.string().email("Email không hợp lệ"),
  phone:        z.string()
    .min(10, "Số điện thoại tối thiểu 10 số")
    .max(15)
    .regex(/^[0-9+\-\s()]+$/, "Số điện thoại không hợp lệ"),
  subject:      z.enum(["hop-tac", "uom-tao", "ho-tro", "khac"], {
    errorMap: () => ({ message: "Vui lòng chọn chủ đề" }),
  }),
  message:      z.string().min(10, "Nội dung tối thiểu 10 ký tự").max(2000),
  website:      z.string().max(0, "Bot detected").optional(),
})

// ── Event Registration ────────────────────────────────────────

export const eventRegistrationSchema = z.object({
  name:         z.string().min(2, "Họ tên tối thiểu 2 ký tự").max(100),
  email:        z.string().email("Email không hợp lệ"),
  phone:        z.string().min(10, "Số điện thoại không hợp lệ").max(15).optional(),
  organization: z.string().max(200).optional(),
  note:         z.string().max(500).optional(),
})

// ── Program Application ───────────────────────────────────────

export const applicationSchema = z.object({
  programId:      z.string().min(1, "Program ID không hợp lệ"),
  applicantName:  z.string().min(2, "Họ tên tối thiểu 2 ký tự").max(100),
  applicantEmail: z.string().email("Email không hợp lệ"),
  applicantPhone: z.string().min(10, "Số điện thoại không hợp lệ").max(15),
  startupName:    z.string().min(2, "Tên startup tối thiểu 2 ký tự").max(200),
  startupWebsite: z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  startupDesc:    z.string().min(50, "Mô tả tối thiểu 50 ký tự").max(2000),
  teamSize:       z.coerce.number().int().min(1).max(100),
  industry:       z.string().min(1, "Vui lòng nhập lĩnh vực").max(100),
  stage:          z.enum(["IDEA", "MVP", "SEED", "SERIES_A", "GROWTH", "SCALE"]),
  fundingRaised:  z.coerce.number().min(0).optional(),
  pitchDeckUrl:   z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  additionalInfo: z.string().max(1000).optional(),
  website:        z.string().max(0, "Bot detected").optional(),
})

// ── Admin: Program CRUD ───────────────────────────────────────
//
// FIX #1: benefits/requirements — form gửi string (textarea), không phải array
// FIX #2: startDate/endDate/applyDeadline — form gửi "YYYY-MM-DD" từ <input type="date">
//         z.string().datetime() yêu cầu ISO-8601 đầy đủ → fail → dùng z.string()

export const programSchema = z.object({
  slug:          z.string().regex(slugRegex, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  name:          z.string().min(3, "Tên tối thiểu 3 ký tự").max(200),
  type:          z.enum(["INCUBATION", "ACCELERATION", "COWORKING"]),
  status:        z.enum(["DRAFT", "OPEN", "CLOSED", "COMPLETED"]),
  shortDesc:     z.string().max(500).optional().or(z.literal("")),
  description:   z.string().optional().or(z.literal("")),
  content:       z.string().optional().or(z.literal("")),
  benefits:      z.array(z.string()).optional().default([]),
  requirements:  z.array(z.string()).optional().default([]),
  maxApplicants: z.coerce.number().int().positive().optional().nullable(),
  startDate:     z.string().optional().or(z.literal("")),  // "YYYY-MM-DD"
  endDate:       z.string().optional().or(z.literal("")),
  applyDeadline: z.string().optional().or(z.literal("")),
  coverImage:    z.string().url().optional().or(z.literal("")),
  isPublished:   z.boolean().default(false),
  isFeatured:    z.boolean().default(false),
  displayOrder:  z.coerce.number().int().min(0).default(0),
})

// ── Admin: Startup CRUD ───────────────────────────────────────
//
// FIX #3: fundingRaised — form gửi string tự do ("$200K", "2 tỷ VND")
//         z.coerce.number() fail → dùng z.string()
// FIX #4: founderName/founderEmail — required trong schema gốc nhưng form optional
//         → đổi thành optional để không block lưu DRAFT
// FIX #5: stage — form dùng "EARLY", schema gốc có "SEED"/"SERIES_A" → align với form

export const startupSchema = z.object({
  slug:            z.string().regex(slugRegex, "Slug không hợp lệ"),
  name:            z.string().min(2).max(200),
  logo:            z.string().url().optional().or(z.literal("")),
  tagline:         z.string().max(200).optional().or(z.literal("")),
  description:     z.string().optional().or(z.literal("")),
  website:         z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  industry:        z.string().max(100).optional().or(z.literal("")),
  stage:           z.enum(["IDEA", "MVP", "EARLY", "GROWTH", "SCALE"]),
  status:          z.enum(["INCUBATING", "ACCELERATING", "GRADUATED", "INACTIVE"]),
  foundedYear:     z.coerce.number().int().min(2000).max(2030).optional().nullable(),
  teamSize:        z.coerce.number().int().min(1).max(10000).optional().nullable(),
  fundingRaised:   z.string().max(100).optional().or(z.literal("")), // string tự do
  coverImage:      z.string().url().optional().or(z.literal("")),
  founderName:     z.string().max(100).optional().or(z.literal("")), // optional
  founderEmail:    z.string().email("Email founder không hợp lệ").optional().or(z.literal("")),
  founderLinkedin: z.string().url().optional().or(z.literal("")),
  linkedinUrl:     z.string().url().optional().or(z.literal("")),
  facebookUrl:     z.string().url().optional().or(z.literal("")),
  tags:            z.array(z.string().min(1)).max(10).default([]),
  isPublished:     z.boolean().default(false),
  isFeatured:      z.boolean().default(false),
  displayOrder:    z.coerce.number().int().min(0).default(0),
})

// ── Admin: Mentor CRUD ────────────────────────────────────────
//
// FIX #6: expertise — form gửi string "A, B, C" từ input text, không phải array
//         → đổi sang z.string()
// bio/shortBio/title không required ở admin (có thể lưu DRAFT chưa điền)

export const mentorSchema = z.object({
  slug:         z.string().regex(slugRegex, "Slug không hợp lệ"),
  name:         z.string().min(2).max(100),
  avatar:       z.string().url().optional().or(z.literal("")),
  title:        z.string().max(200).optional().or(z.literal("")),
  organization: z.string().max(200).optional().or(z.literal("")),
  expertise:    z.string().optional().or(z.literal("")), // "A, B, C" string từ input
  bio:          z.string().optional().or(z.literal("")),
  shortBio:     z.string().max(300).optional().or(z.literal("")),
  email:        z.string().email().optional().or(z.literal("")),
  linkedinUrl:  z.string().url().optional().or(z.literal("")),
  facebookUrl:  z.string().url().optional().or(z.literal("")),
  website:      z.string().url().optional().or(z.literal("")),
  yearsExp:     z.coerce.number().int().min(0).max(60).optional().nullable(),
  tags:         z.array(z.string().min(1)).max(10).default([]),
  status:       z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  isPublished:  z.boolean().default(false),
  isFeatured:   z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
})

// ── Admin: Event CRUD ─────────────────────────────────────────
//
// FIX: startDate/endDate/registerDeadline — form gửi "YYYY-MM-DDTHH:mm"
//      từ <input type="datetime-local">, thiếu seconds và timezone Z
//      z.string().datetime() reject format này → dùng z.string()

export const eventSchema = z.object({
  slug:             z.string().regex(slugRegex, "Slug không hợp lệ"),
  title:            z.string().min(5, "Tiêu đề tối thiểu 5 ký tự").max(300),
  type:             z.enum(["WORKSHOP", "PITCHING", "NETWORKING", "SEMINAR", "CONFERENCE", "OTHER"]),
  status:           z.enum(["DRAFT", "OPEN", "FULL", "ONGOING", "COMPLETED", "CANCELLED"]),
  shortDesc:        z.string().max(500).optional().or(z.literal("")),
  description:      z.string().optional().or(z.literal("")),
  content:          z.string().optional().or(z.literal("")),
  coverImage:       z.string().url().optional().or(z.literal("")),
  startDate:        z.string().min(1, "Ngày bắt đầu là bắt buộc"), // "YYYY-MM-DDTHH:mm"
  endDate:          z.string().optional().or(z.literal("")),
  registerDeadline: z.string().optional().or(z.literal("")),
  isOnline:         z.boolean().default(false),
  location:         z.string().max(500).optional().or(z.literal("")),
  onlineLink:       z.string().url().optional().or(z.literal("")),
  maxAttendees:     z.coerce.number().int().positive().optional().nullable(),
  tags:             z.array(z.string().min(1)).max(10).default([]),
  isPublished:      z.boolean().default(false),
  isFeatured:       z.boolean().default(false),
})

// ── Admin: Article CRUD ───────────────────────────────────────
//
// FIX: excerpt/content/category — optional để không block lưu DRAFT

export const articleSchema = z.object({
  slug:       z.string().regex(slugRegex, "Slug không hợp lệ"),
  title:      z.string().min(5, "Tiêu đề tối thiểu 5 ký tự").max(300),
  excerpt:    z.string().max(500).optional().or(z.literal("")),
  content:    z.string().optional().or(z.literal("")),
  coverImage: z.string().url().optional().or(z.literal("")),
  status:     z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  category:   z.string().max(100).optional().or(z.literal("")),
  tags:       z.array(z.string().min(1)).max(10).default([]),
  metaTitle:  z.string().max(70).optional().or(z.literal("")),
  metaDesc:   z.string().max(160).optional().or(z.literal("")),
})

// ── Admin: Resource CRUD ──────────────────────────────────────

export const resourceSchema = z.object({
  slug:        z.string().regex(slugRegex, "Slug không hợp lệ"),
  title:       z.string().min(3, "Tiêu đề tối thiểu 3 ký tự").max(300),
  description: z.string().max(2000).optional().or(z.literal("")),
  type:        z.enum(["DOCUMENT", "VIDEO", "TEMPLATE", "GUIDE", "TOOL", "OTHER"]),
  fileUrl:     z.string().url("URL file không hợp lệ").optional().or(z.literal("")),
  externalUrl: z.string().url("URL ngoài không hợp lệ").optional().or(z.literal("")),
  coverImage:  z.string().url().optional().or(z.literal("")),
  category:    z.string().max(100).optional().or(z.literal("")),
  tags:        z.array(z.string().min(1)).max(10).default([]),
  isPublished: z.boolean().default(false),
  isFeatured:  z.boolean().default(false),
}).refine(
  (d) => d.fileUrl || d.externalUrl,
  { message: "Cần có file URL hoặc external URL", path: ["fileUrl"] }
)

// ── Admin: Application Review ─────────────────────────────────

export const reviewApplicationSchema = z.object({
  status:     z.enum(["REVIEWING", "APPROVED", "REJECTED", "WAITLISTED"]),
  reviewNote: z.string().max(2000).optional().or(z.literal("")),
})