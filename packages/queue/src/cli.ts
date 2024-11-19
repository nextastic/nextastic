#!/usr/bin/env node

import parseArgs, { ParsedArgs } from 'minimist'
import { startDashboard } from './start-dashboard'

async function cli(args: ParsedArgs) {
  if (args._[0] === 'dashboard') {
    const [_, ...queues] = args._
    const server = await startDashboard(queues)
    
    // Keep the process alive until server is closed
    return new Promise((resolve) => {
      server.on('close', resolve)
    })
  }
}

cli(parseArgs(process.argv.slice(2)))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
