import { HttpException, ThrowingOptions } from './http-exception'

export class TooManyRequestsException extends HttpException {
  constructor(options?: ThrowingOptions) {
    super(
      429,
      { message: 'Too many requests.', type: 'too_many_requests' },
      options
    )
  }
}
