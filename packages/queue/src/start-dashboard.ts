import express from 'express'
import basicAuth from 'express-basic-auth'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import process from 'node:process'
import { config } from '@nextastic/config'
import { getQueue } from './get-queue'

export async function startDashboard(queues: string[]) {
  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/jobs')

  createBullBoard({
    queues: queues.map((queue) => new BullMQAdapter(getQueue(queue))),
    serverAdapter: serverAdapter,
  })

  const app = express()

  // Apply auth middleware to all routes

  const username = config.queue.dashboardUsername
  const password = config.queue.dashboardPassword
  const hasPassword = password !== undefined
  if (hasPassword) {
    // Add auth to require password for access
    const auth = basicAuth({
      users: { [username]: password },
      challenge: true, // Will show browser prompt
    })

    app.use(auth)
  }

  app.use('/jobs', serverAdapter.getRouter())
  app.get('/', (_req, res) => {
    res.send('ok')
  })

  const server = app.listen(3100, () => {
    // eslint-disable-next-line no-console
    console.log('Running on 3100...')

    // eslint-disable-next-line no-console
    console.log('For the UI, open http://localhost:3100/jobs')
  })

  // Handle graceful shutdown
  process.on('SIGTERM', () => server.close())
  process.on('SIGINT', () => server.close())

  return server
}
