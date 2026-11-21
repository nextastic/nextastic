import { AsyncLocalStorage } from 'node:async_hooks'

export interface RunningJob {
  id: string
  name: string
  queue: string
  attempt: number
}

export const jobContext = new AsyncLocalStorage<RunningJob>()
