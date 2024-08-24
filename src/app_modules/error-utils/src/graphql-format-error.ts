import { BadRequestException, NotFoundException } from '@nestjs/common';
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
      if (error instanceof GraphQLError)
        return SevenBoom.badRequest(error as any);
      if (error instanceof BadRequestException)
        return SevenBoom.badRequest(error as any);
      if (error instanceof NotFoundException)
        return SevenBoom.notFound(error as any);

      return SevenBoom.badImplementation(error, { details: error.message });
    },
  });
}
