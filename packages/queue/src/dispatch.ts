import { getQueue } from './get-queue'
import { syncQueue } from './sync-queue'
import { JobsOptions } from 'bullmq'
import { config } from '@nextastic/config'

export interface DispatchOptions extends JobsOptions {
  queue?: string
  /**
   * How long to wait until the job is aborted.
   */
  timeoutSecs?: number
}

export const dispatch = async (
  name: string,
  data: any,
  options: DispatchOptions = {},
) => {
  const {
    queue = config.queue.defaultQueueName,
    timeoutSecs,
    ...jobOptions
  } = options

  if (config.queue.driver === 'sync') {
    return syncQueue.add(name, data, jobOptions)
  }

  return getQueue(queue).add(
    name,
    {
      ...data,
      _nxtc_job_options: {
        timeoutSecs,
      },
    },
    jobOptions,
  )
}
