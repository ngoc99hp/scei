// src/lib/constants.js
// Lookup tables dùng chung cho cả UI và server logic.
// Import từ đây thay vì định nghĩa lại trong từng file.

// ── Programs ──────────────────────────────────────────────────
export const PROGRAM_TYPE_LABEL = {
  INCUBATION:   { label: "Ươm tạo",    color: "bg-blue-50 text-blue-700 border-blue-200" },
  ACCELERATION: { label: "Tăng tốc",   color: "bg-purple-50 text-purple-700 border-purple-200" },
  COWORKING:    { label: "Co-working", color: "bg-green-50 text-green-700 border-green-200" },
}

export const PROGRAM_STATUS_LABEL = {
  OPEN:      { label: "Đang mở đăng ký", dot: "bg-green-500" },
  CLOSED:    { label: "Đã đóng",          dot: "bg-gray-400"  },
  DRAFT:     { label: "Sắp mở",           dot: "bg-yellow-500" },
  COMPLETED: { label: "Đã kết thúc",      dot: "bg-gray-400"  },
}

// ── Events ────────────────────────────────────────────────────
export const EVENT_TYPE_LABEL = {
  WORKSHOP:     "Workshop",
  PITCHING:     "Pitching",
  NETWORKING:   "Networking",
  SEMINAR:      "Seminar",
  CONFERENCE:   "Conference",
  OTHER:        "Khác",
}

export const EVENT_STATUS = {
  OPEN:      { label: "Đang mở đăng ký", dot: "bg-green-500"  },
  FULL:      { label: "Đã đủ chỗ",       dot: "bg-red-500"    },
  ONGOING:   { label: "Đang diễn ra",    dot: "bg-blue-500"   },
  COMPLETED: { label: "Đã kết thúc",     dot: "bg-gray-400"   },
  CANCELLED: { label: "Đã hủy",          dot: "bg-gray-400"   },
  DRAFT:     { label: "Sắp mở",          dot: "bg-yellow-500" },
}

// ── Startups ──────────────────────────────────────────────────
export const STARTUP_STAGE_LABEL = {
  IDEA:     "Ý tưởng",
  MVP:      "MVP",
  SEED:     "Seed",
  SERIES_A: "Series A",
  GROWTH:   "Tăng trưởng",
  SCALE:    "Quy mô",
}

export const STARTUP_STATUS_LABEL = {
  INCUBATING:   { label: "Đang ươm tạo",    color: "bg-blue-50 text-blue-700"   },
  ACCELERATING: { label: "Đang tăng tốc",   color: "bg-purple-50 text-purple-700" },
  GRADUATED:    { label: "Tốt nghiệp",      color: "bg-green-50 text-green-700" },
  INACTIVE:     { label: "Không hoạt động", color: "bg-gray-100 text-gray-500"  },
}

// ── Mentors ───────────────────────────────────────────────────
export const MENTOR_STATUS_LABEL = {
  ACTIVE:   "Đang hoạt động",
  INACTIVE: "Tạm nghỉ",
}

// ── Articles ──────────────────────────────────────────────────
export const ARTICLE_STATUS_LABEL = {
  DRAFT:     { label: "Nháp",        dot: "bg-yellow-500" },
  PUBLISHED: { label: "Đã đăng",     dot: "bg-green-500"  },
  ARCHIVED:  { label: "Lưu trữ",     dot: "bg-gray-400"   },
}

// ── Pagination ────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 12

// ── Resources ─────────────────────────────────────────────────
export const RESOURCE_TYPE_LABEL = {
  DOCUMENT: { label: "Tài liệu",  icon: "📄", color: "bg-blue-50 text-blue-700 border-blue-200" },
  VIDEO:    { label: "Video",     icon: "🎬", color: "bg-red-50 text-red-700 border-red-200" },
  TEMPLATE: { label: "Template",  icon: "📋", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  TOOL:     { label: "Công cụ",   icon: "🔧", color: "bg-green-50 text-green-700 border-green-200" },
  EBOOK:    { label: "Ebook",     icon: "📚", color: "bg-purple-50 text-purple-700 border-purple-200" },
}