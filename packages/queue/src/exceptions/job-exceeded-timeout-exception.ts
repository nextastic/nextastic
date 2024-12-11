export class JobExceededTimeoutException extends Error {
  data?: Record<string, any>
  timeoutSecs?: number
  constructor(message?: string, data?: any, timeoutSecs?: number) {
    super(message ?? 'Job exceeded timeout')
    this.data = data
    this.timeoutSecs = timeoutSecs
  }
}
