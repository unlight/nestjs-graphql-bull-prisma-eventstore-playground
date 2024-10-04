import { ValidationError } from 'class-validator';
import { validationError } from 'class-validator-flat-formatter';
import { BadRequestError } from './errors';

export function exceptionFactory(validationErrors: ValidationError[]) {
  const message = validationError(validationErrors);

  return new BadRequestError(message, {
    props: {
      // Cannot use 'errors', looks like special property
      data: validationErrors,
      statusCode: 400,
    },
  });
}
