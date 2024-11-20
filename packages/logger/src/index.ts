import pino, { LevelWithSilentOrString } from 'pino'
import { config } from '@nextastic/config'

let logger: pino.Logger

export async function getLogger() {
  if (logger) {
    return logger
  }

  logger = pino({
    level: (await config.get('app.logLevel')) as LevelWithSilentOrString,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        messageFormat: '{msg}',
        translateTime: false,
      },
    },
  })

  return logger
}
