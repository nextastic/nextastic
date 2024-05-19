import { HttpException, ThrowingOptions } from './http-exception'
import { HttpExceptionMetadata } from './http-exception'

export class NotFoundException extends HttpException {
  constructor(
    public metadata: HttpExceptionMetadata,
    options?: ThrowingOptions
  ) {
    super(404, metadata, options)
  }
}
