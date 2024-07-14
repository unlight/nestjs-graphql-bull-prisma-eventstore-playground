import { BadRequestException } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { SevenBoom, formatErrorGenerator } from 'graphql-apollo-errors';

type CreateFormatErrorArgs = {};

export function createGraphqlFormatError(args: CreateFormatErrorArgs) {
  return formatErrorGenerator({
    hideSensitiveData: false,
    hooks: {
      onProcessedError: error => {
        const guid = error.output.guid;
        // TODO: Send to remote logging
      },
    },
    nonBoomTransformer: error => {
      return error instanceof BadRequestException ||
        error instanceof GraphQLError
        ? SevenBoom.badRequest(error as any)
        : SevenBoom.badImplementation(error, { details: error.message });
    },
  });
}
