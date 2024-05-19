import {
  HttpException,
  HttpExceptionMetadata,
  ThrowingOptions,
} from './http-exception'

export class MethodNotAllowedException extends HttpException {
  constructor(
    public metadata: HttpExceptionMetadata,
    options?: ThrowingOptions
  ) {
    super(405, metadata, options)
  }
}
