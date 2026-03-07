// src/lib/db.js
// Kết nối Neon PostgreSQL trực tiếp — thay thế Prisma
// Dùng tagged template literal, tự động escape, an toàn SQL injection

import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL chưa được cấu hình trong .env.local")
}

const sql = neon(process.env.DATABASE_URL)

export default sql

/*
─── CÁCH DÙNG ────────────────────────────────────────────────

import sql from "@/lib/db"

// Query nhiều rows
const programs = await sql`
  SELECT * FROM programs
  WHERE is_published = true
  ORDER BY display_order ASC
`

// Query có tham số (tự escape)
const program = await sql`
  SELECT * FROM programs
  WHERE slug = ${slug}
  LIMIT 1
`

// Insert
await sql`
  INSERT INTO contacts (full_name, email, message)
  VALUES (${name}, ${email}, ${message})
`

// Update
await sql`
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = ${id}
`

// Kết quả luôn là array:
// - Query 1 row: result[0]
// - Query nhiều rows: result (array)
// - Insert/Update không cần kết quả: bỏ qua
*/