import {
  HttpException,
  ThrowingOptions,
  HttpExceptionMetadata,
} from './http-exception'

export class NotFoundException extends HttpException {
  constructor(
    public metadata: HttpExceptionMetadata,
    options?: ThrowingOptions
  ) {
    super(404, metadata, options)
  }
}
