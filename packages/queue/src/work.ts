import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { logger } from '@nextastic/logger'
import { Job as BullMQJob } from 'bullmq'
import { getJobs } from './get-jobs'
import { Queue } from './types'

interface WorkConfig {
  jobsDir?: string
}

export async function work(queues: Queue[], config: WorkConfig = {}) {
  const jobs = await getJobs(config.jobsDir)

  for (const queue of queues) {
    const connection = new Redis(process.env.REDIS_HOST!, {
      maxRetriesPerRequest: null,
    })

    new Worker(
      queue.name,
      async (job: BullMQJob) => {
        logger.debug(`got job: ${job.name}`, {
          event: 'job.start',
          data: JSON.stringify(job.data),
        })
        const definedJob = jobs[job.name]
        if (!definedJob) {
          logger.debug(`Missing job handler" ${job.name}`, {
            event: 'job.missing_handler',
            data: JSON.stringify(job.data),
          })
          return
        }

        try {
          const result = await definedJob.handle(job.data as any, {
            id: job.id,
          }) // Ignore TS, as already type-safe when accessing hadnle
          logger.debug(`Completed job: ${job.name}`, {
            event: 'job.complete',
            data: JSON.stringify(job.data),
            result,
          })
          return result
        } catch (error: unknown) {
          if (error instanceof Error) {
            logger.debug(`Failed job: ${job.name}`, {
              event: 'job.failed',
              data: JSON.stringify(job.data),
              error: error.message,
              stack: error.stack,
            })

            throw error
          }

          logger.debug(`Failed job: ${job.name}`, {
            event: 'job.failed',
            data: JSON.stringify(job.data),
            error,
          })

          throw error
        }
      },
      {
        connection,
        concurrency: queue.concurrency,
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 5000 },
        lockDuration: 600000, // 10 mins job timeout. Increased as code-gen (writing code) takes a while.
      }
    ) as any

    // eslint-disable-next-line no-console
    console.log(`Worker running jobs on "${queue.name}".`)
  }
}
