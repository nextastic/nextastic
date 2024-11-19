import { generateUuid } from '@nextastic/utils'
import { getJobs } from './get-jobs'
import { JobsOptions } from 'bullmq'

/**
 * Synchronous queue that just executes the handler immediately in the
 * same process. Useful for debugging, and tests in CI.
 */
export const syncQueue = {
  add: async (job: string, data: any, _opts?: JobsOptions) => {
    const jobs = await getJobs()
    const defined = jobs[job]
    if (!defined) {
      throw new Error(`Missing job definition: ${job}`)
    }

    await defined.handle(data, {
      id: generateUuid(),
      log: (message: string) => {
        console.log(message)
      },
    })
  },
  getRepeatableJobs: () => [],
  removeRepeatableByKey: (_key: string) => {},
  remove: (_key: string) => {},
}
