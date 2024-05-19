import { HttpException, ThrowingOptions } from './http-exception'

export class UnauthorizedException extends HttpException {
  constructor(options?: ThrowingOptions) {
    super(401, { message: 'Unauthorized.', type: 'unauthorized' }, options)
  }
}
