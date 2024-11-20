import { config } from '@nextastic/config'
import { Queue } from 'bullmq'
import Redis from 'ioredis'

const queues: Record<string, Queue> = {}

export const getQueue = (name: string) => {
  const existingQueue = queues[name]
  if (existingQueue) {
    return existingQueue
  }

  const connection = new Redis(config.redis.host)

  const queue = new Queue(name, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    },
  })

  queues[name] = queue

  return queue
}
