import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { validationErrorsAsString } from 'class-validator-flat-formatter';

export function exceptionFactory(validationErrors: ValidationError[]) {
  const message = validationErrorsAsString(validationErrors);
  return new BadRequestException(message);
}
