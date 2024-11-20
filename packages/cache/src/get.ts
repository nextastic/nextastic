import { createRedisClient } from '@nextastic/redis'
import process from 'node:process'

const driver = process.env.CACHE_DRIVER ?? 'redis'

export async function get(key: string, defaultValue?: any) {
  if (driver === 'redis') {
    const redis = await createRedisClient()
    const value = await redis.get(key)
    return value ?? defaultValue
  }

  return defaultValue
}
