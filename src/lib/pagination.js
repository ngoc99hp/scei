// src/lib/pagination.js
// Pagination utilities dùng chung cho tất cả list pages.
// URL-based pagination (searchParams) tương thích Next.js App Router.

import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

/**
 * Parse page number từ searchParams.
 * @param {string|string[]|undefined} param
 * @returns {number} page >= 1
 */
export function parsePage(param) {
  const n = parseInt(param, 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

/**
 * Tính offset từ page + pageSize.
 */
export function toOffset(page, pageSize = DEFAULT_PAGE_SIZE) {
  return (page - 1) * pageSize
}

/**
 * Tính tổng số trang.
 */
export function totalPages(count, pageSize = DEFAULT_PAGE_SIZE) {
  return Math.max(1, Math.ceil(count / pageSize))
}

/**
 * Trả về metadata pagination để truyền vào component.
 * @param {number} count - tổng số records
 * @param {number} page - trang hiện tại
 * @param {number} [pageSize]
 */
export function buildPagination(count, page, pageSize = DEFAULT_PAGE_SIZE) {
  const pages = totalPages(count, pageSize)
  return {
    page,
    pageSize,
    total: count,
    pages,
    hasPrev: page > 1,
    hasNext: page < pages,
  }
}