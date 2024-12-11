import { Worker } from 'bullmq'
import Redis from 'ioredis'
import { Job as BullMQJob } from 'bullmq'
import { getJobs } from './get-jobs'
import { Queue } from './types'
import { config } from '@nextastic/config'
import { logger } from '@nextastic/logger'

interface WorkParams {
  queues: Queue[]
  jobsDir?: string
}

export async function work(params: WorkParams) {
  const { queues, jobsDir } = params
  const jobs = await getJobs(jobsDir)

  for (const queue of queues) {
    const connection = new Redis(config.redis.host, {
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
            log: (message: string) => {
              job.log(message)
              logger.debug(message, {
                event: 'job.log',
                job: job.name,
                data: JSON.stringify(job.data),
              })
            },
            timeoutSecs: job.data?._nxtc_job_options?.timeoutSecs,
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
        removeOnComplete: {
          count: config.queue.maxCompletedJobs,
        },
        removeOnFail: {
          count: config.queue.maxFailedJobs,
        },
        lockDuration: config.queue.jobTimeoutMs,
      },
    ) as any

    // eslint-disable-next-line no-console
    console.log(`Worker running jobs on "${queue.name}".`)
  }
}
