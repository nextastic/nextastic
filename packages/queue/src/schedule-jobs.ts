import { getQueue } from './get-queue'
import { Queue } from './types'

export async function scheduleJobs(queues: Queue[], schedule: () => void) {
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

  schedule()

  // eslint-disable-next-line no-console
  console.log('Scheduled jobs added.')
}
