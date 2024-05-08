import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  Logger,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { validationErrorsAsString } from 'class-validator-flat-formatter';
import { ensure } from 'errorish';
import { JsonObject } from 'type-fest';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(this.constructor.name);

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

export function exceptionFactory(validationErrors: ValidationError[]) {
  const message = validationErrorsAsString(validationErrors);
  const result = new BadRequestException(message);

  return result;
}
