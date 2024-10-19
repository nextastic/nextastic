import parseArgs, { ParsedArgs } from 'minimist'
import { makeMigration } from './scripts/make-migration'
import { drop } from './scripts/drop'
import { makeTypes } from './scripts/make-types'

async function cli(args: ParsedArgs) {
  console.log('GOT ARGS: ', args)

  if (args._[0] === 'make:migration') {
    makeMigration(args._[1])
    return
  }

  if (args._[0] === 'drop') {
    await drop()
  }

  if (args._[0] === 'make:types') {
    await makeTypes()
  }
}

cli(parseArgs(process.argv.slice(2)))
