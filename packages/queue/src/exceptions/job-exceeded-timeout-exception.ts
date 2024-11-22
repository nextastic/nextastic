export class JobExceededTimeoutException extends Error {
  data?: Record<string, any>
  timeoutMs?: number
  constructor(message?: string, data?: any, timeoutMs?: number) {
    super(message ?? 'Job exceeded timeout')
    this.data = data
    this.timeoutMs = timeoutMs
  }
}
