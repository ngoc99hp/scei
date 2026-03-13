// src/lib/__tests__/sanitize.test.js
//
// Test suite cho sanitizeHtml() — chạy với: node src/lib/__tests__/sanitize.test.js
// (Không cần Jest hay test framework — pure Node.js)

import { sanitizeHtml, escapeHtml } from "../sanitize.js"

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (err) {
    console.log(`  ❌ ${name}`)
    console.log(`     Expected: ${err.expected}`)
    console.log(`     Got:      ${err.got}`)
    failed++
  }
}

function assert(actual, expected, msg) {
  if (actual !== expected) {
    const err = new Error(msg || "Assertion failed")
    err.expected = expected
    err.got = actual
    throw err
  }
}

function assertContains(haystack, needle) {
  if (!haystack.includes(needle)) {
    const err = new Error("String not found")
    err.expected = `contains "${needle}"`
    err.got = haystack
    throw err
  }
}

function assertNotContains(haystack, needle) {
  if (haystack.includes(needle)) {
    const err = new Error("Dangerous string found!")
    err.expected = `NOT contains "${needle}"`
    err.got = haystack
    throw err
  }
}

console.log("\n🔒 sanitizeHtml() — XSS Prevention Tests\n")

// ── Script injection ──────────────────────────────────────────────────────────

console.log("Script Injection:")

test("removes <script> tags", () => {
  const input = '<p>Hello</p><script>alert("XSS")</script><p>World</p>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "<script>")
  assertNotContains(result, "alert")
  assertContains(result, "<p>Hello</p>")
})

test("removes <script> with src", () => {
  const input = '<script src="https://evil.com/xss.js"></script>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "<script")
  assertNotContains(result, "evil.com")
})

test("removes inline script with attributes", () => {
  const input = '<script type="text/javascript">document.cookie</script>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "document.cookie")
})

// ── Event handler injection ────────────────────────────────────────────────────

console.log("\nEvent Handler Injection:")

test("removes onclick attribute", () => {
  const input = '<a href="/page" onclick="steal()">Link</a>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "onclick")
  assertNotContains(result, "steal()")
  assertContains(result, "href=\"/page\"")
})

test("removes onerror on img", () => {
  const input = '<img src="x" onerror="alert(1)" alt="test" />'
  const result = sanitizeHtml(input)
  assertNotContains(result, "onerror")
  assertContains(result, 'alt="test"')
})

test("removes onmouseover", () => {
  const input = '<div onmouseover="evil()">hover me</div>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "onmouseover")
})

test("removes all on* handlers", () => {
  const handlers = ["onload", "onfocus", "onblur", "onkeydown", "onsubmit", "onchange"]
  for (const handler of handlers) {
    const input = `<div ${handler}="evil()">text</div>`
    const result = sanitizeHtml(input)
    assertNotContains(result, handler)
  }
})

// ── JavaScript URL injection ───────────────────────────────────────────────────

console.log("\nJavaScript URL Injection:")

test("removes javascript: in href", () => {
  const input = '<a href="javascript:alert(1)">click</a>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "javascript:")
})

test("removes javascript: with spaces/encoding", () => {
  const input = '<a href="  javascript:alert(1)">click</a>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "javascript:")
})

test("removes data: URL in src", () => {
  const input = '<img src="data:text/html,<script>alert(1)</script>" alt="x" />'
  const result = sanitizeHtml(input)
  assertNotContains(result, "data:")
})

test("removes vbscript: in href", () => {
  const input = '<a href="vbscript:msgbox(1)">click</a>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "vbscript:")
})

// ── Dangerous tags ────────────────────────────────────────────────────────────

console.log("\nDangerous Tag Removal:")

test("removes <iframe>", () => {
  const input = '<iframe src="https://evil.com"></iframe>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "<iframe")
})

test("removes <object>", () => {
  const input = '<object data="evil.swf"></object>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "<object")
})

test("removes <embed>", () => {
  const input = '<embed src="evil.swf" />'
  const result = sanitizeHtml(input)
  assertNotContains(result, "<embed")
})

test("removes <form> and inputs", () => {
  const input = '<form action="/phish"><input type="text" name="cc" /></form>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "<form")
  assertNotContains(result, "<input")
})

test("removes <style>", () => {
  const input = '<style>body{display:none}</style><p>content</p>'
  const result = sanitizeHtml(input)
  assertNotContains(result, "<style")
  assertContains(result, "<p>content</p>")
})

// ── Safe content preserved ────────────────────────────────────────────────────

console.log("\nSafe Content Preservation:")

test("keeps safe paragraph tags", () => {
  const input = "<p>Hello <strong>world</strong></p>"
  const result = sanitizeHtml(input)
  assertContains(result, "<p>")
  assertContains(result, "<strong>")
  assertContains(result, "Hello")
})

test("keeps safe link with relative href", () => {
  const input = '<a href="/about">About us</a>'
  const result = sanitizeHtml(input)
  assertContains(result, 'href="/about"')
  assertContains(result, "About us")
})

test("keeps safe link with https href", () => {
  const input = '<a href="https://scei.vn/programs">Programs</a>'
  const result = sanitizeHtml(input)
  assertContains(result, 'href="https://scei.vn/programs"')
})

test("adds rel=noopener to target=_blank links", () => {
  const input = '<a href="https://example.com" target="_blank">External</a>'
  const result = sanitizeHtml(input)
  assertContains(result, 'target="_blank"')
  assertContains(result, "noopener")
  assertContains(result, "noreferrer")
})

test("keeps image with alt", () => {
  const input = '<img src="https://cdn.scei.vn/img.jpg" alt="Team photo" />'
  const result = sanitizeHtml(input)
  assertContains(result, "img.jpg")
  assertContains(result, 'alt="Team photo"')
})

test("keeps headings h1-h6", () => {
  for (let i = 1; i <= 6; i++) {
    const input = `<h${i}>Heading ${i}</h${i}>`
    const result = sanitizeHtml(input)
    assertContains(result, `<h${i}>`)
  }
})

test("keeps lists", () => {
  const input = "<ul><li>Item 1</li><li>Item 2</li></ul>"
  const result = sanitizeHtml(input)
  assertContains(result, "<ul>")
  assertContains(result, "<li>")
})

test("keeps blockquote", () => {
  const input = "<blockquote><p>Quote text</p></blockquote>"
  const result = sanitizeHtml(input)
  assertContains(result, "<blockquote")
})

test("keeps code and pre blocks", () => {
  const input = "<pre><code>const x = 1;</code></pre>"
  const result = sanitizeHtml(input)
  assertContains(result, "<pre>")
  assertContains(result, "<code>")
})

// ── Edge cases ────────────────────────────────────────────────────────────────

console.log("\nEdge Cases:")

test("handles empty string", () => {
  assert(sanitizeHtml(""), "")
  assert(sanitizeHtml(null), "")
  assert(sanitizeHtml(undefined), "")
})

test("handles plain text (no HTML)", () => {
  const input = "Đây là văn bản thuần túy không có HTML"
  const result = sanitizeHtml(input)
  assertContains(result, "Đây là văn bản thuần túy")
})

test("handles HTML comment injection", () => {
  const input = "<!-- <script>alert(1)</script> --><p>safe</p>"
  const result = sanitizeHtml(input)
  assertNotContains(result, "<!--")
  assertContains(result, "<p>safe</p>")
})

// ── escapeHtml ────────────────────────────────────────────────────────────────

console.log("\nescapeHtml():")

test("escapes < > & \" '", () => {
  const input = '<script>alert("XSS & more")</script>'
  const result = escapeHtml(input)
  assertNotContains(result, "<script")
  assertContains(result, "&lt;script&gt;")
  assertContains(result, "&amp;")
  assertContains(result, "&quot;")
})

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`)
console.log(`Results: ${passed} passed, ${failed} failed`)
if (failed === 0) {
  console.log("🎉 All tests passed! XSS protection is working correctly.\n")
  process.exit(0)
} else {
  console.log("💥 Some tests failed! Review the sanitizer.\n")
  process.exit(1)
}