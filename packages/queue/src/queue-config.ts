import { get } from '@nextastic/cache'

interface QueueConfig {
  driver: 'redis' | 'sync'
}

export const getQueueConfig = async (): Promise<QueueConfig> => {
  return {
    driver: await get(
      'nextastic.queue.driver',
      (process.env.QUEUE_DRIVER as any) ?? 'redis'
    ),
  }
}
