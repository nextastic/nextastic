import { createRedisClient } from '@nextastic/redis'

export async function set(key: string, value: any) {
  const redis = await createRedisClient()
  return (await redis.set(key, value)) === 'OK'
}
