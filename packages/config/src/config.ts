import { Config } from './constructor'

export const config = new Config({
  defaultValues: {
    app: {
      /**
       * The log level to use for logging
       * @default 'info'
       */
      logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL ?? 'info',
      /**
       * The URL of the app
       * @default 'http://localhost:3000'
       */
      url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    },
    db: {
      /**
       * The database name to use for the database connection
       * @default 'postgres'
       */
      POSTGRES_DB: process.env.POSTGRES_DB ?? 'postgres',
    },
    queue: {
      /**
       * The queue driver to use for job processing
       * @default 'redis'
       */
      driver: process.env.QUEUE_DRIVER ?? 'redis',

      /**
       * Maximum number of completed jobs to keep in the queue history
       * @default 1000
       */
      maxCompletedJobs: parseInt(
        process.env.QUEUE_MAX_COMPLETED_JOBS ?? '1000'
      ),

      /**
       * Maximum number of failed jobs to retain before cleanup
       * @default 1000
       */
      maxFailedJobs: parseInt(process.env.QUEUE_MAX_FAILED_JOBS ?? '1000'),

      /**
       * Timeout in milliseconds before another worker could pick up the job
       * @default 60000
       */
      jobTimeoutMs: parseInt(process.env.QUEUE_JOB_TIMEOUT_MS ?? '60000'),

      /**
       * The username for the queue dashboard
       * @default 'admin'
       */
      dashboardUsername: process.env.QUEUE_DASHBOARD_USERNAME ?? 'admin',

      /**
       * The password for the queue dashboard
       * @default undefined
       */
      dashboardPassword: process.env.QUEUE_DASHBOARD_PASSWORD,
    },
    redis: {
      /**
       * The Redis host or connection URL
       * @default '127.0.0.1'
       */
      host: process.env.REDIS_HOST ?? '127.0.0.1',
    },
  },
})
