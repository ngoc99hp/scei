// src/lib/validations.js
// Zod schemas dùng chung cho cả client form và server API
// Import từ đây để tránh định nghĩa lặp lại

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
  // Honeypot field — phải rỗng (bot thường điền vào)
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
  // Honeypot
  website:        z.string().max(0, "Bot detected").optional(),
})

// ── Admin: Program CRUD ───────────────────────────────────────

export const programSchema = z.object({
  slug:           z.string().regex(slugRegex, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
  name:           z.string().min(3, "Tên tối thiểu 3 ký tự").max(200),
  type:           z.enum(["INCUBATION", "ACCELERATION", "COWORKING"]),
  status:         z.enum(["DRAFT", "OPEN", "CLOSED", "COMPLETED"]),
  shortDesc:      z.string().min(10).max(500),
  description:    z.string().min(50, "Mô tả tối thiểu 50 ký tự"),
  benefits:       z.array(z.string().min(1)).min(1, "Cần ít nhất 1 quyền lợi").max(20),
  requirements:   z.array(z.string().min(1)).min(1, "Cần ít nhất 1 yêu cầu").max(20),
  maxApplicants:  z.coerce.number().int().positive().optional().nullable(),
  startDate:      z.string().datetime().optional().nullable(),
  endDate:        z.string().datetime().optional().nullable(),
  applyDeadline:  z.string().datetime().optional().nullable(),
  coverImage:     z.string().url().optional().or(z.literal("")),
  isPublished:    z.boolean().default(false),
  isFeatured:     z.boolean().default(false),
  displayOrder:   z.coerce.number().int().min(0).default(0),
})

// ── Admin: Startup CRUD ───────────────────────────────────────

export const startupSchema = z.object({
  slug:           z.string().regex(slugRegex, "Slug không hợp lệ"),
  name:           z.string().min(2).max(200),
  logo:           z.string().url().optional().or(z.literal("")),
  tagline:        z.string().min(10, "Tagline tối thiểu 10 ký tự").max(200),
  description:    z.string().min(50, "Mô tả tối thiểu 50 ký tự"),
  website:        z.string().url("URL không hợp lệ").optional().or(z.literal("")),
  industry:       z.string().min(1).max(100),
  stage:          z.enum(["IDEA", "MVP", "SEED", "SERIES_A", "GROWTH", "SCALE"]),
  status:         z.enum(["INCUBATING", "ACCELERATING", "GRADUATED", "INACTIVE"]),
  foundedYear:    z.coerce.number().int().min(2000).max(2030).optional().nullable(),
  teamSize:       z.coerce.number().int().min(1).max(10000).optional().nullable(),
  fundingRaised:  z.coerce.number().min(0).optional().nullable(),
  coverImage:     z.string().url().optional().or(z.literal("")),
  founderName:    z.string().min(2).max(100),
  founderEmail:   z.string().email("Email founder không hợp lệ"),
  founderLinkedin: z.string().url().optional().or(z.literal("")),
  linkedinUrl:    z.string().url().optional().or(z.literal("")),
  facebookUrl:    z.string().url().optional().or(z.literal("")),
  tags:           z.array(z.string().min(1)).max(10).default([]),
  isPublished:    z.boolean().default(false),
  isFeatured:     z.boolean().default(false),
  displayOrder:   z.coerce.number().int().min(0).default(0),
})

// ── Admin: Mentor CRUD ────────────────────────────────────────

export const mentorSchema = z.object({
  slug:         z.string().regex(slugRegex, "Slug không hợp lệ"),
  name:         z.string().min(2).max(100),
  avatar:       z.string().url().optional().or(z.literal("")),
  title:        z.string().min(2, "Chức danh tối thiểu 2 ký tự").max(200),
  organization: z.string().max(200).optional().or(z.literal("")),
  expertise:    z.array(z.string().min(1)).min(1, "Ít nhất 1 chuyên môn").max(10),
  bio:          z.string().min(50, "Tiểu sử tối thiểu 50 ký tự"),
  shortBio:     z.string().min(10, "Tóm tắt tối thiểu 10 ký tự").max(300),
  email:        z.string().email().optional().or(z.literal("")),
  linkedinUrl:  z.string().url().optional().or(z.literal("")),
  facebookUrl:  z.string().url().optional().or(z.literal("")),
  website:      z.string().url().optional().or(z.literal("")),
  yearsExp:     z.coerce.number().int().min(0).max(60).optional().nullable(),
  tags:         z.array(z.string().min(1)).max(10).default([]),
  status:       z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  isPublished:  z.boolean().default(true),
  isFeatured:   z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
})

// ── Admin: Event CRUD ─────────────────────────────────────────

export const eventSchema = z.object({
  slug:             z.string().regex(slugRegex, "Slug không hợp lệ"),
  title:            z.string().min(5, "Tiêu đề tối thiểu 5 ký tự").max(300),
  type:             z.enum(["WORKSHOP", "PITCHING", "NETWORKING", "SEMINAR", "CONFERENCE", "OTHER"]),
  status:           z.enum(["DRAFT", "OPEN", "FULL", "ONGOING", "COMPLETED", "CANCELLED"]),
  shortDesc:        z.string().min(10).max(500),
  description:      z.string().min(50, "Mô tả tối thiểu 50 ký tự"),
  coverImage:       z.string().url().optional().or(z.literal("")),
  startDate:        z.string().datetime("Ngày bắt đầu không hợp lệ"),
  endDate:          z.string().datetime().optional().nullable(),
  registerDeadline: z.string().datetime().optional().nullable(),
  isOnline:         z.boolean().default(false),
  location:         z.string().max(500).optional().or(z.literal("")),
  onlineLink:       z.string().url().optional().or(z.literal("")),
  maxAttendees:     z.coerce.number().int().positive().optional().nullable(),
  tags:             z.array(z.string().min(1)).max(10).default([]),
  isPublished:      z.boolean().default(false),
  isFeatured:       z.boolean().default(false),
})

// ── Admin: Article CRUD ───────────────────────────────────────

export const articleSchema = z.object({
  slug:        z.string().regex(slugRegex, "Slug không hợp lệ"),
  title:       z.string().min(5, "Tiêu đề tối thiểu 5 ký tự").max(300),
  excerpt:     z.string().min(20, "Tóm tắt tối thiểu 20 ký tự").max(500),
  content:     z.string().min(100, "Nội dung tối thiểu 100 ký tự"),
  coverImage:  z.string().url().optional().or(z.literal("")),
  status:      z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  category:    z.string().min(1, "Vui lòng chọn danh mục").max(100),
  tags:        z.array(z.string().min(1)).max(10).default([]),
  metaTitle:   z.string().max(70).optional().or(z.literal("")),
  metaDesc:    z.string().max(160).optional().or(z.literal("")),
})

// ── Admin: Application Review ─────────────────────────────────

export const reviewApplicationSchema = z.object({
  status:     z.enum(["REVIEWING", "APPROVED", "REJECTED", "WAITLISTED"]),
  reviewNote: z.string().max(2000).optional().or(z.literal("")),
})