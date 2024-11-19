import { generateUuid } from '@nextastic/utils'
import { debouncedDispatch } from './debounced-dispatch'
import { getQueue } from './get-queue'
import { syncQueue } from './sync-queue'
import { JobsOptions } from 'bullmq'
import { getQueueConfig } from './get-queue-config'

export interface DispatchOptions extends JobsOptions {
  queue?: string
  /**
   * Whether to debounce dispatches, and only execute the latest dispatch
   * after a specified amount of time.
   */
  debounce?: DebounceOptions
}

interface DebounceOptions {
  /**
   * All dispatches with the same key will be debounced together.
   */
  key: string
  /**
   * Unique job id. Specify the same ID to have the debounce skip the delay
   * if it wasalready dispatched earlier.
   */
  id: string
  /**
   * How long to wait until no further dispatches before executing.
   */
  delaySecs: number
}

export const dispatch = async (
  name: string,
  data: any,
  options: DispatchOptions = {}
) => {
  const { queue = 'default', debounce, ...jobOptions } = options

  const config = await getQueueConfig()

  if (config.driver === 'sync') {
    return syncQueue.add(name, data, jobOptions)
  }

  if (debounce) {
    return debouncedDispatch({
      job: {
        name,
        data,
        options: jobOptions,
      },
      debounce: {
        key: debounce.key,
        id: debounce.id ?? generateUuid(),
        delaySecs: debounce.delaySecs,
      },
    })
  }

  return getQueue(queue).add(name, data, jobOptions)
}
