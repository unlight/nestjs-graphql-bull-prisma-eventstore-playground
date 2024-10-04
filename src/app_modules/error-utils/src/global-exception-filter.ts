import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { JsonObject } from 'type-fest';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalException');

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.error(exception);

    // if (
    //   host.getType<string>() === 'graphql' &&
    //   exception &&
    //   typeof exception === 'object'
    // ) {
    //   this.extendError(exception, { message });
    // }

    return exception;
  }

  private extendError(exception: JsonObject, overrides: JsonObject) {
    for (const [key, value] of Object.entries(overrides)) {
      if (value) exception[key] = value;
    }
  }
}
