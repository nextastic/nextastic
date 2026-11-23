import { hostname } from 'node:os'
import { Worker } from 'bullmq'
import { config } from '@nextastic/config'
import { SendJobLog } from './capture-job-lines'

type CancelJob = (args: { queueName: string; jobId: string }) => boolean

interface WorkerConnector {
  sendJobLog: SendJobLog
  stop(): Promise<void>
}

interface SuperbullConnectorModule {
  startConnector(args: {
    url: string
    token: string
    name: string
    appVersion: string | null
    redisHost: string
    workers: Worker[]
    cancelJob: CancelJob
  }): WorkerConnector
}

// The app installs @superbull/connector itself: without it, or without a
// token, the worker runs as before.
export async function startSuperbullConnector(args: {
  workers: Worker[]
  cancelJob: CancelJob
}): Promise<WorkerConnector | null> {
  const token = process.env.SUPERBULL_TOKEN
  if (!token) {
    return null
  }

  const connectorModule = await importConnector()
  if (!connectorModule) {
    return null
  }

  return connectorModule.startConnector({
    url: process.env.SUPERBULL_URL ?? 'wss://connect.superbull.com',
    token,
    name: process.env.QUEUE_RUNNER_APP ?? hostname(),
    appVersion: process.env.QUEUE_RUNNER_VERSION ?? null,
    redisHost: config.redis.host,
    workers: args.workers,
    cancelJob: args.cancelJob,
  })
}

async function importConnector(): Promise<SuperbullConnectorModule | null> {
  // A variable name keeps TypeScript from needing the package to be installed.
  const moduleName = '@superbull/connector'
  try {
    return (await import(moduleName)) as SuperbullConnectorModule
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      `SUPERBULL_TOKEN is set but @superbull/connector did not load, so the worker runs without it: ${String(error)}`,
    )
    return null
  }
}
