#!/usr/bin/env node

import parseArgs, { ParsedArgs } from 'minimist'
import { makeMigration } from './scripts/make-migration.js'
import { drop } from './scripts/drop.js'
import { makeTypes } from './scripts/make-types.js'
import { migrate } from './scripts/migrate.js'

async function cli(args: ParsedArgs) {
  if (args._[0] === 'make:migration') {
    makeMigration(args._[1])
    return
  }

  if (args._[0] === 'drop') {
    await drop()
  }

  if (args._[0] === 'make:types') {
    const [_cmd, ...schemas] = args._
    await makeTypes(schemas)
    console.log(`Types generated for schemas ${schemas.join(', ')}.`)
  }

  if (args._[0] === 'migrate') {
    await migrate(args._[1])
  }
}

cli(parseArgs(process.argv.slice(2)))
