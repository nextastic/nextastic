import parseArgs, { ParsedArgs } from 'minimist'
import { makeMigration } from './scripts/make-migration'

async function cli(args: ParsedArgs) {
  console.log('GOT ARGS: ', args)

  if (args._[0] === 'make:migration') {
    makeMigration(args._[1])
    return
  }
}

cli(parseArgs(process.argv.slice(2)))
