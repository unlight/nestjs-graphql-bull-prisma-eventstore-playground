import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { ensure } from 'errorish';
import { JsonObject } from 'type-fest';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalException');

  catch(exception: unknown, host: ArgumentsHost) {
    const error = ensure(exception);

    this.logger.error(error);

    // if (
    //   host.getType<string>() === 'graphql' &&
    //   exception &&
    //   typeof exception === 'object'
    // ) {
    //   this.extendError(exception, { message });
    // }

    return error;
  }

  private extendError(exception: JsonObject, overrides: JsonObject) {
    for (const [key, value] of Object.entries(overrides)) {
      if (value) exception[key] = value;
    }
  }
}
