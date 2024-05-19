import {
  HttpException,
  HttpExceptionMetadata,
  ThrowingOptions,
} from './http-exception'

export class InternalServerErrorException extends HttpException {
  constructor(
    public metadata: HttpExceptionMetadata,
    options?: ThrowingOptions
  ) {
    super(500, metadata, options)
  }
}
