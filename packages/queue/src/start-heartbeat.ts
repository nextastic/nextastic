import { Worker } from 'bullmq'
import Redis from 'ioredis'

const heartbeatIntervalMs = 20_000
const heartbeatTimeoutMs = 5_000

// The queue-runner counts a new version as started at its first heartbeat,
// so the first one goes out only once every queue's worker can take jobs.
export async function startHeartbeat(
  queues: Array<{ worker: Worker; connection: Redis }>,
) {
  const url = process.env.QUEUE_RUNNER_HEARTBEAT_URL
  if (!url) {
    return
  }

  await Promise.all(queues.map(({ worker }) => worker.waitUntilReady()))

  const sendHeartbeat = () => {
    const body = {
      app: process.env.QUEUE_RUNNER_APP,
      version: process.env.QUEUE_RUNNER_VERSION,
      queues: queues.map(({ worker, connection }) => ({
        name: worker.name,
        connected: worker.isRunning() && connection.status === 'ready',
      })),
    }
    fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(heartbeatTimeoutMs),
    }).catch((error: unknown) => {
      // eslint-disable-next-line no-console
      console.warn(`Heartbeat to the queue-runner failed: ${String(error)}`)
    })
  }

  sendHeartbeat()
  setInterval(sendHeartbeat, heartbeatIntervalMs).unref()
}
