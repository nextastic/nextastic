import parseArgs, { ParsedArgs } from 'minimist'
import { makeMigration } from './scripts/make-migration'
import { drop } from './scripts/drop'
import { makeTypes } from './scripts/make-types'
import { migrate } from './scripts/migrate'

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
    const [_cmd, ...schemas] = args._
    await makeTypes(schemas)
    console.log(`Types generated for schemas ${schemas.join(', ')}.`)
  }

  if (args._[0] === 'migrate') {
    await migrate()
  }
}

cli(parseArgs(process.argv.slice(2)))
