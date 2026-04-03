// src/app/api/health/route.js
//
// Health check endpoint cho Vercel, uptime monitors, và load balancers.
//
// GET /api/health
//   → 200 { status: "ok", ... }      tất cả checks pass
//   → 503 { status: "degraded", ... } ít nhất 1 check fail
//
// Checks:
//   - db:    ping Neon PostgreSQL
//   - redis: ping Upstash Redis (skip nếu chưa cấu hình env)
//
// Response headers:
//   Cache-Control: no-store  — không cache health response
//   X-Response-Time          — latency tổng (ms)

import { NextResponse } from "next/server"
import sql              from "@/lib/db"
import { logger }       from "@/lib/logger"

export const dynamic = "force-dynamic"

const TIMEOUT_MS = 5000 // timeout mỗi check

/**
 * Wrap một promise với timeout.
 * @template T
 * @param {Promise<T>} promise
 * @param {number} ms
 * @returns {Promise<T>}
 */
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ])
}

/**
 * Ping Neon PostgreSQL.
 * @returns {{ ok: boolean, latencyMs: number, error?: string }}
 */
async function checkDb() {
  const start = Date.now()
  try {
    await withTimeout(sql`SELECT 1`, TIMEOUT_MS)
    return { ok: true, latencyMs: Date.now() - start }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: err.message }
  }
}

/**
 * Ping Upstash Redis.
 * Trả về { ok: true, skipped: true } nếu chưa cấu hình env.
 * @returns {{ ok: boolean, latencyMs?: number, skipped?: boolean, error?: string }}
 */
async function checkRedis() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return { ok: true, skipped: true }
  }
  const start = Date.now()
  try {
    const { Redis } = await import("@upstash/redis")
    const redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    await withTimeout(redis.ping(), TIMEOUT_MS)
    return { ok: true, latencyMs: Date.now() - start }
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start, error: err.message }
  }
}

export async function GET() {
  const requestStart = Date.now()

  // Chạy song song tất cả checks
  const [db, redis] = await Promise.all([
    checkDb(),
    checkRedis(),
  ])

  const allOk      = db.ok && redis.ok
  const totalMs    = Date.now() - requestStart
  const statusCode = allOk ? 200 : 503

  const body = {
    status:      allOk ? "ok" : "degraded",
    timestamp:   new Date().toISOString(),
    responseMs:  totalMs,
    version:     process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
    environment: process.env.NODE_ENV,
    checks: {
      db,
      redis,
    },
  }

  if (!allOk) {
    logger.warn("Health check degraded", { db, redis, totalMs })
  }

  return NextResponse.json(body, {
    status: statusCode,
    headers: {
      "Cache-Control":  "no-store",
      "X-Response-Time": `${totalMs}ms`,
    },
  })
}