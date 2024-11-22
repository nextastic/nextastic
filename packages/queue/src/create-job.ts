import { dispatch, DispatchOptions } from './dispatch'
import { Job as BullMQJob } from 'bullmq'
import { JobExceededTimeoutException } from './exceptions'

type JobContext = {
  /**
   * Unique ID for the job
   */
  id?: string
  log: (message: string) => void
  timeoutSecs?: number
  signal?: AbortSignal
}

export type Job<TData = any, JReturnData = any> = {
  id: string
  handle: (payload: TData, context: JobContext) => Promise<JReturnData>
  dispatch: (
    payload: TData,
    options?: DispatchOptions
  ) => Promise<void | BullMQJob<any, any, string>>
}

interface CreateJobParams<TData, JReturnData> {
  id: string
  handle: (payload: TData, context: JobContext) => Promise<JReturnData>
}

export function createJob<TData, JReturnData>(
  params: CreateJobParams<TData, JReturnData>
): Job<TData, JReturnData> {
  return {
    id: params.id,
    handle: async (payload: TData, context: JobContext) => {
      const abortController = new AbortController()
      const jobHandleContext: JobContext = {
        ...context,
        signal: abortController.signal,
      }

      const { timeoutSecs } = context
      if (!timeoutSecs) {
        return params.handle(payload, jobHandleContext)
      }

      return new Promise(async (resolve, reject) => {
        let isResolved = false
        const timeoutError = new JobExceededTimeoutException(
          `Job ${params.id} exceeded timeout of ${timeoutSecs} seconds`,
          payload,
          timeoutSecs
        )

        const timeoutTimer = setTimeout(() => {
          if (isResolved) {
            return
          }

          abortController.abort()
          reject(timeoutError)
        }, timeoutSecs * 1000)

        try {
          const result = await params.handle(payload, jobHandleContext)
          isResolved = true

          if (abortController.signal.aborted) {
            reject(timeoutError)
            return
          }

          clearTimeout(timeoutTimer)
          resolve(result)
        } catch (error) {
          isResolved = true
          clearTimeout(timeoutTimer)
          // Only swallow AbortError if it was caused by our timeout
          if (
            error instanceof Error &&
            error.name === 'AbortError' &&
            abortController.signal.aborted
          ) {
            return
          }
          reject(error)
        }
      })
    },
    dispatch: async (payload: TData, options?: DispatchOptions) =>
      dispatch(params.id, payload, options),
  }
}
