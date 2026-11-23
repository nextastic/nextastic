import { AsyncLocalStorage } from 'node:async_hooks'

export interface RunningJob {
  queueName: string
  jobId: string
  jobName: string
  attempt: number
}

export const jobContext = new AsyncLocalStorage<RunningJob>()
