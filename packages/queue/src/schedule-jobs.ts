import { getQueue } from './get-queue'
import { Queue } from './types'

interface ScheduleJobsParams {
  queues: Queue[]
  schedule: () => void
}

export async function scheduleJobs(params: ScheduleJobsParams) {
  const { queues, schedule } = params
  for (const queue of queues) {
    const queueInstance = await getQueue(queue.name)

    const schedulers = await queueInstance.getJobSchedulers()
    if (!schedulers) {
      continue
    }

    for (const job of schedulers) {
      await queueInstance.removeJobScheduler(job.key)
    }
  }

  schedule()

  // eslint-disable-next-line no-console
  console.log('Scheduled jobs added.')
}
