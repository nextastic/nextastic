import { RedisClientType, createClient } from 'redis'
import Redis from 'ioredis'

let client: Redis | null

export const createRedisClient = async () => {
  if (client) {
    return client
  }

  client = new Redis(process.env.REDIS_HOST!)

  return client
}
