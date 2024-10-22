import { createJob } from './create-job'
import { createRedisClient } from '@nextastic/redis'
import { dispatch, DispatchOptions } from './dispatch'

export const debounceJob = createJob({
  id: 'debounce_job',
  handle: async (payload: {
    job: {
      name: string
      data: any
      opts?: DispatchOptions
    }
    debounce: {
      key: string
      id: string
      delaySecs: number
    }
  }) => {
    const { job: targetJob, debounce } = payload

    const redis = await createRedisClient()

    const currentId = await redis.get(debounce.key)

    // If another id exists, then we can assume another job has been dispatched
    // so we'll ignore this one.
    if (currentId && currentId !== debounce.id) {
      return
    }

    await dispatch(targetJob.name, targetJob.data, targetJob.opts)
  },
})
