import { createRedisClient } from './create-redis-client'

interface RateLimitParams {
  max: number
  durationSecs: number
}

export async function rateLimit(key: string, params: RateLimitParams) {
  const { durationSecs, max } = params

  const redis = await createRedisClient()

  const result = await redis.multi().incr(key).expire(key, durationSecs).exec()

  const current = result?.[0]?.[1]
  if (typeof current !== 'number') {
    return false
  }

  if (current > max) {
    return true
  }

  return false
}
