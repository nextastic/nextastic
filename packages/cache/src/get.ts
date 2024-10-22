import { createRedisClient } from '@nextastic/redis'

export async function get(key: string, defaultValue?: any) {
  const redis = await createRedisClient()
  const value = await redis.get(key)
  return value ?? defaultValue
}
