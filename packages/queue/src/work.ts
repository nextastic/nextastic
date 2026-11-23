import { DelayedError, UnrecoverableError, Worker } from 'bullmq'
import Redis from 'ioredis'
import { Job as BullMQJob } from 'bullmq'
import { getJobs } from './get-jobs'
import { Job } from './create-job'
import { Queue } from './types'
import { config } from '@nextastic/config'
import { logger } from '@nextastic/logger'
import { jobContext, RunningJob } from './job-context'
import { captureJobLines } from './capture-job-lines'
import { startHeartbeat } from './start-heartbeat'
import { startSuperbullConnector } from './start-superbull-connector'

// A job whose name this version does not know waits for a version that does.
const unknownJobRetryMs = 15_000
const unknownJobGiveUpMs = 15 * 60_000
// A cancelled job that ignores its signal this long is ended.
const cancelDeadlineMs = 60_000

interface WorkParams {
  queues: Queue[]
  jobsDir?: string
}

export async function work(params: WorkParams) {
  const { queues, jobsDir } = params
  const jobs = await getJobs(jobsDir)
  const runningJobs = new Map<string, AbortController>()
  const workerQueues: Array<{ worker: Worker; connection: Redis }> = []

  for (const queue of queues) {
    const connection = new Redis(config.redis.host, {
      maxRetriesPerRequest: null,
    })

    const worker: Worker = new Worker(
      queue.name,
      async (job: BullMQJob, token?: string) => {
        const runningJob: RunningJob = {
          queueName: queue.name,
          jobId: String(job.id),
          jobName: job.name,
          attempt: job.attemptsMade + 1,
        }
        const runningJobKey = `${queue.name}:${job.id}`
        const abortController = new AbortController()
        runningJobs.set(runningJobKey, abortController)
        try {
          return await jobContext.run(runningJob, () =>
            runJob({
              job,
              token,
              definedJob: jobs[job.name],
              signal: abortController.signal,
              sendLog: (message) =>
                connector?.sendJobLog({ ...runningJob, level: 'info', message }),
            }),
          )
        } finally {
          runningJobs.delete(runningJobKey)
        }
      },
      {
        connection,
        prefix: config.queue.prefix,
        concurrency: queue.concurrency,
        removeOnComplete: {
          count: config.queue.maxCompletedJobs,
        },
        removeOnFail: {
          count: config.queue.maxFailedJobs,
        },
        lockDuration: config.queue.jobTimeoutMs,
        // The connector starts first, so every job's lines can reach it.
        autorun: false,
      },
    ) as any
    workerQueues.push({ worker, connection })
  }

  const workers = workerQueues.map(({ worker }) => worker)
  const connector = await startSuperbullConnector({
    workers,
    cancelJob: ({ queueName, jobId }) => {
      const abortController = runningJobs.get(`${queueName}:${jobId}`)
      if (!abortController) {
        return false
      }
      abortController.abort()
      return true
    },
  })
  captureJobLines(connector?.sendJobLog ?? null)

  for (const worker of workers) {
    worker.run().catch((error: unknown) => {
      // eslint-disable-next-line no-console
      console.error(`Worker on "${worker.name}" stopped: ${String(error)}`)
    })
    // eslint-disable-next-line no-console
    console.log(`Worker running jobs on "${worker.name}".`)
  }

  startHeartbeat(workerQueues).catch((error: unknown) => {
    // eslint-disable-next-line no-console
    console.warn(`Heartbeat did not start: ${String(error)}`)
  })

  closeOnStopSignal({
    workers,
    stopConnector: connector ? () => connector.stop() : null,
  })
}

async function runJob(args: {
  job: BullMQJob
  token: string | undefined
  definedJob: Job | undefined
  signal: AbortSignal
  sendLog: (message: string) => void
}) {
  const { job, token, definedJob, signal, sendLog } = args
  logger.debug(`got job: ${job.name}`, {
    event: 'job.start',
    data: JSON.stringify(job.data),
  })

  if (!definedJob) {
    return putBackUnknownJob(job, token)
  }

  try {
    const run = definedJob.handle(job.data as any, {
      id: job.id,
      log: (message: string) => {
        job.log(message)
        sendLog(message)
        logger.debug(message, {
          event: 'job.log',
          job: job.name,
          data: JSON.stringify(job.data),
        })
      },
      timeoutSecs: job.data?._nxtc_job_options?.timeoutSecs,
      signal,
    }) // Ignore TS, as already type-safe when accessing hadnle
    const result = await runUntilCancelled(run, signal)
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
}

// During a deploy the old and the new worker both take jobs, so a job added
// by new code can reach a worker that does not know it yet.
async function putBackUnknownJob(job: BullMQJob, token: string | undefined) {
  const runnableSince = job.timestamp + (job.opts.delay ?? 0)
  if (Date.now() - runnableSince > unknownJobGiveUpMs) {
    throw new UnrecoverableError(
      `No job named "${job.name}" in any version that ran it in ${unknownJobGiveUpMs / 60_000} minutes.`,
    )
  }

  // eslint-disable-next-line no-console
  console.warn(
    `No job named "${job.name}" in this version: it waits ${unknownJobRetryMs / 1000} seconds for a new one.`,
  )
  await job.moveToDelayed(Date.now() + unknownJobRetryMs, token)
  throw new DelayedError()
}

// A cancelled job is never tried again. One that ignores its signal is ended
// after the deadline: its slot is freed, though its code may still run.
async function runUntilCancelled<T>(run: Promise<T>, signal: AbortSignal) {
  let deadlineTimer: NodeJS.Timeout | undefined
  const deadlineError = new UnrecoverableError(
    `Cancelled: the job did not stop within ${cancelDeadlineMs / 1000} seconds and was ended.`,
  )
  const deadline = new Promise<never>((_resolve, reject) => {
    signal.addEventListener(
      'abort',
      () => {
        deadlineTimer = setTimeout(() => reject(deadlineError), cancelDeadlineMs)
      },
      { once: true },
    )
  })

  try {
    const result = await Promise.race([run, deadline])
    if (signal.aborted) {
      throw new UnrecoverableError('Cancelled.')
    }
    return result
  } catch (error) {
    if (signal.aborted && error !== deadlineError) {
      throw new UnrecoverableError('Cancelled.')
    }
    throw error
  } finally {
    clearTimeout(deadlineTimer)
  }
}

// A deploy stops the old process with SIGTERM. Closing takes no new jobs and
// lets running ones finish, so a job is not cut off halfway. The connector
// stops last, so it reports those jobs.
function closeOnStopSignal(args: {
  workers: Worker[]
  stopConnector: (() => Promise<void>) | null
}) {
  const { workers, stopConnector } = args
  const close = async (signal: NodeJS.Signals) => {
    // eslint-disable-next-line no-console
    console.log(`${signal}: closing workers after their running jobs.`)
    await Promise.all(workers.map((worker) => worker.close()))
    await stopConnector?.()
    process.exit(0)
  }
  process.once('SIGTERM', close)
  process.once('SIGINT', close)
}
