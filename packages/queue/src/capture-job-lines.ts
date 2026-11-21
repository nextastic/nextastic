import { format } from 'node:util'
import { logger } from '@nextastic/logger'
import { jobContext, RunningJob } from './job-context'

export type JobLogLevel = 'debug' | 'info' | 'warn' | 'error'

export type SendJobLog = (line: {
  queueName: string
  jobId: string
  jobName: string
  attempt: number
  level: JobLogLevel
  message: string
}) => void

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
    job_id: job.id,
    job_name: job.name,
    queue: job.queue,
    attempt: job.attempt,
  }
}

export function sendLineOfJob(args: {
  job: RunningJob
  level: JobLogLevel
  message: string
  sendJobLog: SendJobLog | null
}) {
  const { job, level, message, sendJobLog } = args
  sendJobLog?.({
    queueName: job.queue,
    jobId: job.id,
    jobName: job.name,
    attempt: job.attempt,
    level,
    message,
  })
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
        sendLineOfJob({ job, level, message, sendJobLog })
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
        sendLineOfJob({
          job,
          level: getJobLogLevel(info.level),
          message: String(info.message),
          sendJobLog,
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
