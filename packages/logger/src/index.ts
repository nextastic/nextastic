import pino, { LevelWithSilentOrString } from 'pino'
import { config } from '@nextastic/config'

export const logger = pino({
  level: config.app.logLevel as LevelWithSilentOrString,
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
