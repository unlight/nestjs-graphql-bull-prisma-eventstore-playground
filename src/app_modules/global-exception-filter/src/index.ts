import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import { validationErrorsAsString } from 'class-validator-flat-formatter';
import { serializeError } from 'serialize-error';
import { JsonObject } from 'type-fest';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const serializedError = serializeError(exception);
    this.logger.error(serializedError.stack);

    const message = this.getValidationError(exception);
    if (message) {
      this.logger.error(message);
    }

    if (
      host.getType<string>() === 'graphql' &&
      exception &&
      typeof exception === 'object'
    ) {
      this.extendError(exception, { message });
    }

    return exception;
  }

  private extendError(exception: JsonObject, overrides: JsonObject) {
    for (const [key, value] of Object.entries(overrides)) {
      if (value) exception[key] = value;
    }
  }

  private getValidationError(exception: unknown): string | undefined {
    if (exception instanceof BadRequestException) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const validationErrors = exception.getResponse()['message'];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const message = validationErrorsAsString(validationErrors);

      return message;
    }
  }
}
