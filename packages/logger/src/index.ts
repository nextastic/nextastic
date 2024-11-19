import pino from 'pino'

export const logger = pino({
  level: process.env.NEXT_PUBLIC_LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      messageFormat: '{msg}',
      translateTime: false
    }
  }
})
