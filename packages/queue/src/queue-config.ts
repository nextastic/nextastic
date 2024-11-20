import { Config } from '@nextastic/config'

export const queueConfig = new Config({
  name: 'queue',
  defaultValues: {
    driver: process.env.QUEUE_DRIVER ?? 'redis',
    maxCompletedJobs: parseInt(process.env.QUEUE_MAX_COMPLETED_JOBS ?? '1000'),
    maxFailedJobs: parseInt(process.env.QUEUE_MAX_FAILED_JOBS ?? '1000'),
    jobTimeoutMs: parseInt(process.env.QUEUE_JOB_TIMEOUT_MS ?? '60000'),
  },
})

