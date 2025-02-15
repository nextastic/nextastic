import { getQueue } from './get-queue'
import { Queue } from './types'

interface ScheduleJobsParams {
  queues: Pick<Queue, 'name'>[]
  schedule: () => Promise<void>
}

export async function scheduleJobs(params: ScheduleJobsParams) {
  const { queues, schedule } = params
  for (const queue of queues) {
    const queueInstance = getQueue(queue.name)

    const schedulers = await queueInstance.getJobSchedulers()
    if (!schedulers) {
      continue
    }

    for (const job of schedulers) {
      await queueInstance.removeJobScheduler(job.key)
    }
  }

  await schedule()

  // eslint-disable-next-line no-console
  console.log('Scheduled jobs added.')
}
