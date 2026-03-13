// src/lib/rate-limit.js
// Rate limiter dựa trên sliding window với Upstash Redis.
// Nếu UPSTASH_REDIS_REST_URL chưa cấu hình → fallback sang in-memory
// (chỉ dùng cho local dev, không đảm bảo cross-instance trên production).
//
// Setup Upstash (free tier đủ dùng):
//   1. upstash.com → tạo Redis database
//   2. Thêm vào .env.local:
//      UPSTASH_REDIS_REST_URL=...
//      UPSTASH_REDIS_REST_TOKEN=...
//   3. npm install @upstash/redis

const WINDOW_MS  = 60_000  // 1 phút
const MAX_REQ    = 10      // số request tối đa mỗi window

// ── In-memory fallback (local dev / khi chưa có Redis) ─────────
const memStore = new Map()

function memLimit(key) {
  const now    = Date.now()
  const record = memStore.get(key) ?? { count: 0, resetAt: now + WINDOW_MS }

  if (now > record.resetAt) {
    record.count   = 0
    record.resetAt = now + WINDOW_MS
  }
  record.count++
  memStore.set(key, record)

  return {
    ok:        record.count <= MAX_REQ,
    remaining: Math.max(0, MAX_REQ - record.count),
    reset:     Math.ceil((record.resetAt - now) / 1000),
  }
}

// ── Upstash Redis (production) ──────────────────────────────────
let redis = null

async function redisLimit(key) {
  if (!redis) {
    const { Redis } = await import("@upstash/redis")
    redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }

  const pipeline = redis.pipeline()
  const now      = Math.floor(Date.now() / 1000)
  const window   = Math.floor(now / (WINDOW_MS / 1000))
  const rKey     = `rl:${key}:${window}`

  pipeline.incr(rKey)
  pipeline.expire(rKey, Math.ceil(WINDOW_MS / 1000) + 5)

  const [count] = await pipeline.exec()
  const remaining = Math.max(0, MAX_REQ - count)

  return {
    ok:        count <= MAX_REQ,
    remaining,
    reset:     (window + 1) * Math.ceil(WINDOW_MS / 1000) - now,
  }
}

// ── Public API ─────────────────────────────────────────────────
/**
 * Kiểm tra rate limit cho 1 IP / key.
 * @param {string} key - thường là IP address
 * @returns {{ ok: boolean, remaining: number, reset: number }}
 */
export async function rateLimit(key) {
  const useRedis =
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN

  try {
    return useRedis ? await redisLimit(key) : memLimit(key)
  } catch {
    // Nếu Redis lỗi → fail open (cho phép request qua)
    console.warn("[rateLimit] Redis error, fail-open")
    return { ok: true, remaining: 1, reset: 60 }
  }
}