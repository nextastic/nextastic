import * as childProcess from 'node:child_process'

export function makeMigration(name: string) {
  childProcess.execSync(
    `npx node-pg-migrate --migration-file-language ts -m src/database/migrations create ${name}`
  )

  // eslint-disable-next-line no-console
  console.log(`Migration ${name} created`)
}
