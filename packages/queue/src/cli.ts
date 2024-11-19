#!/usr/bin/env node

import parseArgs, { ParsedArgs } from 'minimist'
import { startDashboard } from './start-dashboard'

async function cli(args: ParsedArgs) {
  if (args._[0] === 'dashboard') {
    const [_, ...queues] = args._
    startDashboard(queues)
    return
  }
}

cli(parseArgs(process.argv.slice(2)))
