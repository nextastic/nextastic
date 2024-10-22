import pino from 'pino'

export const logger = pino({
  level: process.env.NEXT_PUBLIC_LOG_LEVEL,
})
