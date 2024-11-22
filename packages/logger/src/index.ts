import { config } from '@nextastic/config'

import winston, { format, transports as winstonTransports } from 'winston'

const transports = [new winstonTransports.Console()]

export const logger = winston.createLogger({
  level: config.app.logLevel,
  format: format.combine(format.errors({ stack: true }), format.json()),
  transports: transports,
})
