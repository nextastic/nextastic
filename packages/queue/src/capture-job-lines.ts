import { format } from 'node:util'
import { logger } from '@nextastic/logger'
import { jobContext, RunningJob } from './job-context'

export type JobLogLevel = 'debug' | 'info' | 'warn' | 'error'

export type SendJobLog = (
  line: RunningJob & { level: JobLogLevel; message: string },
) => void

const consoleLevels = {
  debug: 'debug',
  log: 'info',
  info: 'info',
  warn: 'warn',
  error: 'error',
} as const

// A line written inside a job carries the job's fields on stdout and goes to
// Superbull, with no change in any job file.
export function captureJobLines(sendJobLog: SendJobLog | null) {
  captureConsole(sendJobLog)
  captureLogger(sendJobLog)
}

export function getJobFields(job: RunningJob) {
  return {
    job_id: job.jobId,
    job_name: job.jobName,
    queue: job.queueName,
    attempt: job.attempt,
  }
}

function captureConsole(sendJobLog: SendJobLog | null) {
  // The connector's own warnings can run inside a job's context; they print
  // as they are and are not sent, so a send can never loop into itself.
  let isSending = false

  for (const method of Object.keys(consoleLevels) as Array<keyof typeof consoleLevels>) {
    const original = console[method].bind(console)
    const level = consoleLevels[method]

    console[method] = (...args: unknown[]) => {
      const job = jobContext.getStore()
      if (!job || isSending) {
        original(...args)
        return
      }

      const message = format(...args)
      original(JSON.stringify({ level, message, ...getJobFields(job) }))
      isSending = true
      try {
        sendJobLog?.({ ...job, level, message })
      } finally {
        isSending = false
      }
    }
  }
}

function captureLogger(sendJobLog: SendJobLog | null) {
  const originalFormat = logger.format

  logger.format = {
    transform: (info, options) => {
      const job = jobContext.getStore()
      if (!job) {
        return originalFormat.transform(info, options)
      }

      // log() sends its own line; its debug copy is not sent twice.
      const isFromJobLog = info.event === 'job.log'
      if (!isFromJobLog && logger.isLevelEnabled(info.level)) {
        sendJobLog?.({
          ...job,
          level: getJobLogLevel(info.level),
          message: String(info.message),
        })
      }
      return originalFormat.transform(
        { ...info, ...getJobFields(job) },
        options,
      )
    },
  }
}

function getJobLogLevel(winstonLevel: string): JobLogLevel {
  if (winstonLevel === 'error') {
    return 'error'
  }
  if (winstonLevel === 'warn') {
    return 'warn'
  }
  if (winstonLevel === 'info') {
    return 'info'
  }
  return 'debug'
}
