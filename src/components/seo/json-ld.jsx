// src/components/seo/json-ld.jsx
// JSON-LD Structured Data — giúp Google hiểu nội dung → rich snippets.
//
// ✅ SEO FIX — Thiếu JSON-LD → bỏ lỡ rich snippets:
//    - Event: hiện ngày/địa điểm ngay trong SERP
//    - Article: hiện author, date, thumbnail
//    - BreadcrumbList: hiện breadcrumb path dưới title
//    - Organization: hiện knowledge panel
//
// Cách dùng: import component tương ứng vào page.js, đặt ở cuối <article>
//
// Docs: https://developers.google.com/search/docs/appearance/structured-data

// ── Primitive ─────────────────────────────────────────────────────────────────

/**
 * Render một <script type="application/ld+json"> block.
 * Server Component — không tốn bundle client.
 */
function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data, null, 0) }}
    />
  )
}

// ── Organization (dùng trong root layout hoặc về trang chủ) ─────────────────

export function OrganizationJsonLd() {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL 
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "SCEI",
        alternateName: "Trung tâm Hỗ trợ Khởi nghiệp Đổi mới Sáng tạo",
        url: BASE,
        logo: `${BASE}/logo.png`,
        sameAs: [
          "https://facebook.com/scei.vn",
          "https://linkedin.com/company/scei-vn",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+84-28-1234-5678",
          contactType: "customer service",
          availableLanguage: ["Vietnamese", "English"],
        },
      }}
    />
  )
}

// ── Article ───────────────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} props.url           - Full URL của bài viết
 * @param {string} props.imageUrl      - Cover image URL
 * @param {string} props.authorName
 * @param {string} props.publishedAt   - ISO date string
 * @param {string} props.modifiedAt    - ISO date string
 * @param {string[]} [props.keywords]
 */
export function ArticleJsonLd({
  title, description, url, imageUrl,
  authorName, publishedAt, modifiedAt, keywords = [],
}) {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL 
  return (
    <JsonLd
      data={{
        "@context":         "https://schema.org",
        "@type":            "NewsArticle",
        headline:           title,
        description,
        url,
        image:              imageUrl ? [imageUrl] : [],
        datePublished:      publishedAt,
        dateModified:       modifiedAt ?? publishedAt,
        keywords:           keywords.join(", "),
        author: {
          "@type": "Person",
          name:    authorName,
        },
        publisher: {
          "@type": "Organization",
          name:    "SCEI",
          logo: {
            "@type": "ImageObject",
            url:     `${BASE}/logo.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id":   url,
        },
      }}
    />
  )
}

// ── Event ─────────────────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {string} props.name
 * @param {string} props.description
 * @param {string} props.url
 * @param {string} props.imageUrl
 * @param {string} props.startDate     - ISO datetime string
 * @param {string} props.endDate       - ISO datetime string
 * @param {string} props.location      - Tên địa điểm
 * @param {string} [props.address]     - Địa chỉ đầy đủ
 * @param {"EventMovedOnline"|"EventScheduled"|"EventCancelled"|"EventPostponed"} [props.status]
 * @param {"Online"|"Mixed"|"OfflineEventAttendanceMode"} [props.mode]
 * @param {number} [props.price]       - 0 = miễn phí
 */
export function EventJsonLd({
  name, description, url, imageUrl,
  startDate, endDate, location, address,
  status = "EventScheduled",
  mode   = "OfflineEventAttendanceMode",
  price  = 0,
}) {
  const schemaMode = mode === "Online"
    ? "OnlineEventAttendanceMode"
    : mode === "Mixed"
      ? "MixedEventAttendanceMode"
      : "OfflineEventAttendanceMode"

  return (
    <JsonLd
      data={{
        "@context":     "https://schema.org",
        "@type":        "Event",
        name,
        description,
        url,
        image:          imageUrl ? [imageUrl] : [],
        startDate,
        endDate,
        eventStatus:    `https://schema.org/${status}`,
        eventAttendanceMode: `https://schema.org/${schemaMode}`,
        location: mode === "Online"
          ? { "@type": "VirtualLocation", url }
          : {
              "@type":   "Place",
              name:      location,
              address:   address
                ? { "@type": "PostalAddress", streetAddress: address, addressCountry: "VN" }
                : undefined,
            },
        offers: {
          "@type":       "Offer",
          price:         String(price),
          priceCurrency: "VND",
          url,
          availability:  "https://schema.org/InStock",
        },
        organizer: {
          "@type": "Organization",
          name:    "SCEI",
          url:     process.env.NEXT_PUBLIC_SITE_URL ,
        },
      }}
    />
  )
}

// ── Program ───────────────────────────────────────────────────────────────────

/**
 * Programs → schema Course là gần nhất
 */
export function ProgramJsonLd({
  name, description, url, imageUrl,
  providerName = "SCEI",
  startDate, endDate,
}) {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL 
  return (
    <JsonLd
      data={{
        "@context":     "https://schema.org",
        "@type":        "Course",
        name,
        description,
        url,
        image:          imageUrl ? [imageUrl] : [],
        startDate,
        endDate,
        provider: {
          "@type": "Organization",
          name:    providerName,
          url:     BASE,
        },
        hasCourseInstance: {
          "@type":                  "CourseInstance",
          courseMode:               "blended",
          startDate,
          endDate,
          instructor: {
            "@type": "Organization",
            name:    providerName,
          },
        },
      }}
    />
  )
}

// ── BreadcrumbList ────────────────────────────────────────────────────────────

/**
 * @param {Array<{name: string, href: string}>} items
 * @example
 * <BreadcrumbJsonLd items={[
 *   { name: "Trang chủ", href: "/" },
 *   { name: "Sự kiện",   href: "/events" },
 *   { name: event.title, href: `/events/${event.slug}` },
 * ]} />
 */
export function BreadcrumbJsonLd({ items }) {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL 
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type":    "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type":   "ListItem",
          position:  i + 1,
          name:      item.name,
          item:      item.href.startsWith("http") ? item.href : `${BASE}${item.href}`,
        })),
      }}
    />
  )
}

// ── Person (Mentor) ───────────────────────────────────────────────────────────

export function PersonJsonLd({
  name, description, url, imageUrl,
  jobTitle, worksForName = "SCEI",
  sameAs = [],
}) {
  return (
    <JsonLd
      data={{
        "@context":  "https://schema.org",
        "@type":     "Person",
        name,
        description,
        url,
        image:       imageUrl,
        jobTitle,
        worksFor: {
          "@type": "Organization",
          name:    worksForName,
        },
        sameAs,
      }}
    />
  )
}