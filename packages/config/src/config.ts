export const config = {
  app: {
    /**
     * The log level to use for logging
     * @env NEXT_PUBLIC_LOG_LEVEL
     * @default 'info'
     */
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL ?? 'info',
    /**
     * The URL of the app
     * @env NEXT_PUBLIC_APP_URL
     * @default 'http://localhost:3000'
     */
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  },
  db: {
    /**
     * The database name to use for the database connection
     * @env POSTGRES_DB
     * @default 'postgres'
     */
    name: process.env.POSTGRES_DB ?? 'postgres',
  },
  cache: {
    /**
     * Where to store the cache
     * @env CACHE_DRIVER
     * @default 'redis'
     */
    driver: process.env.CACHE_DRIVER ?? 'redis',
  },
  queue: {
    /**
     * The queue driver to use for job processing
     * @env QUEUE_DRIVER
     * @default 'redis'
     */
    driver: process.env.QUEUE_DRIVER ?? 'redis',

    /**
     * Maximum number of completed jobs to keep in the queue history
     * @env QUEUE_MAX_COMPLETED_JOBS
     * @default 1000
     */
    maxCompletedJobs: parseInt(process.env.QUEUE_MAX_COMPLETED_JOBS ?? '1000'),

    /**
     * Maximum number of failed jobs to retain before cleanup
     * @env QUEUE_MAX_FAILED_JOBS
     * @default 1000
     */
    maxFailedJobs: parseInt(process.env.QUEUE_MAX_FAILED_JOBS ?? '1000'),

    /**
     * Timeout in milliseconds before another worker could pick up the job
     * @env QUEUE_JOB_TIMEOUT_MS
     * @default 60000
     */
    jobTimeoutMs: parseInt(process.env.QUEUE_JOB_TIMEOUT_MS ?? '60000'),

    /**
     * The username for the queue dashboard
     * @env QUEUE_DASHBOARD_USERNAME
     * @default 'admin'
     */
    dashboardUsername: process.env.QUEUE_DASHBOARD_USERNAME ?? 'admin',

    /**
     * The password for the queue dashboard
     * @env QUEUE_DASHBOARD_PASSWORD
     * @default undefined
     */
    dashboardPassword: process.env.QUEUE_DASHBOARD_PASSWORD,

    /**
     * The default queue name
     * @env QUEUE_DEFAULT_QUEUE_NAME
     * @default 'default'
     */
    defaultQueueName: process.env.QUEUE_DEFAULT_QUEUE_NAME ?? 'default',
  },
  redis: {
    /**
     * The Redis host or connection URL
     * @env REDIS_HOST
     * @default '127.0.0.1'
     */
    host: process.env.REDIS_HOST ?? '127.0.0.1',
  },
}
