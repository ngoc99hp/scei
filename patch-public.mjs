#!/usr/bin/env node
// patch-public.mjs
// Chạy: node patch-public.mjs
// Tự động patch các file public mà không cần sửa tay từng file.
//
// Việc script làm:
//   1. Thêm generateStaticParams vào 6 slug pages
//   2. Sửa events/page.js — filter DRAFT → ONGOING

import fs from "fs"
import path from "path"

const SRC = "src"

// ── 1. Patch slug pages — thêm generateStaticParams ──────────────────────────

const slugPatches = [
  {
    file: `${SRC}/app/(public)/events/[slug]/page.js`,
    importLine: `import { generateEventStaticParams } from "@/lib/generate-static-params"`,
    exportLine: `export const generateStaticParams = generateEventStaticParams`,
  },
  {
    file: `${SRC}/app/(public)/news/[slug]/page.js`,
    importLine: `import { generateArticleStaticParams } from "@/lib/generate-static-params"`,
    exportLine: `export const generateStaticParams = generateArticleStaticParams`,
  },
  {
    file: `${SRC}/app/(public)/programs/[slug]/page.js`,
    importLine: `import { generateProgramStaticParams } from "@/lib/generate-static-params"`,
    exportLine: `export const generateStaticParams = generateProgramStaticParams`,
  },
  {
    file: `${SRC}/app/(public)/startups/[slug]/page.js`,
    importLine: `import { generateStartupStaticParams } from "@/lib/generate-static-params"`,
    exportLine: `export const generateStaticParams = generateStartupStaticParams`,
  },
  {
    file: `${SRC}/app/(public)/mentors/[slug]/page.js`,
    importLine: `import { generateMentorStaticParams } from "@/lib/generate-static-params"`,
    exportLine: `export const generateStaticParams = generateMentorStaticParams`,
  },
  {
    file: `${SRC}/app/(public)/resources/[slug]/page.js`,
    importLine: `import { generateResourceStaticParams } from "@/lib/generate-static-params"`,
    exportLine: `export const generateStaticParams = generateResourceStaticParams`,
  },
]

for (const { file, importLine, exportLine } of slugPatches) {
  const fullPath = path.resolve(file)
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  Not found: ${file}`)
    continue
  }

  let content = fs.readFileSync(fullPath, "utf8")

  // Skip nếu đã patch rồi
  if (content.includes("generateStaticParams")) {
    console.log(`✅ Already patched: ${file}`)
    continue
  }

  // Thêm import sau dòng đầu tiên có "import"
  const firstImportIdx = content.indexOf("\nimport ")
  if (firstImportIdx === -1) {
    // Không tìm thấy import block — thêm vào đầu file
    content = importLine + "\n" + exportLine + "\n\n" + content
  } else {
    // Tìm cuối block import (dòng cuối cùng bắt đầu bằng "import")
    const lines = content.split("\n")
    let lastImportLine = 0
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("import ")) lastImportLine = i
    }
    // Chèn sau lastImportLine
    lines.splice(lastImportLine + 1, 0, "", importLine, exportLine)
    content = lines.join("\n")
  }

  fs.writeFileSync(fullPath, content, "utf8")
  console.log(`✅ Patched: ${file}`)
}

// ── 2. Patch events/page.js — sửa filter DRAFT → ONGOING ─────────────────────

const eventsPage = path.resolve(`${SRC}/app/(public)/events/page.js`)
if (fs.existsSync(eventsPage)) {
  let content = fs.readFileSync(eventsPage, "utf8")

  const OLD_UPCOMING = `events.filter(e => e.status === "OPEN" || e.status === "DRAFT")`
  const NEW_UPCOMING = `events.filter(e => e.status === "OPEN" || e.status === "ONGOING")`
  const OLD_PAST     = `events.filter(e => e.status !== "OPEN" && e.status !== "DRAFT")`
  const NEW_PAST     = `events.filter(e => e.status !== "OPEN" && e.status !== "ONGOING")`

  if (content.includes(OLD_UPCOMING)) {
    content = content
      .replace(OLD_UPCOMING, NEW_UPCOMING)
      .replace(OLD_PAST, NEW_PAST)
    fs.writeFileSync(eventsPage, content, "utf8")
    console.log(`✅ Patched events filter: ${eventsPage}`)
  } else {
    console.log(`✅ Events filter already correct or not found (check manually)`)
  }
} else {
  console.warn(`⚠️  Not found: ${SRC}/app/(public)/events/page.js`)
}

console.log("\n🎉 Done! Kiểm tra lại bằng: npm run build")
