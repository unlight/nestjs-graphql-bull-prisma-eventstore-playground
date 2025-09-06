import { flatten } from 'flat';
import { GraphQLError } from 'graphql';
import { castArray } from 'lodash';
import { ObjectType } from 'simplytyped';
import { JsonObject } from 'type-fest';

import { BaseError } from './errors';

export function createGraphqlFormatError() {
  return (object: ObjectType<GraphQLError>, graphqlError: GraphQLError) => {
    const originalError = graphqlError.originalError || graphqlError;
    const message = object.message;
    const path = object.path;
    const code = object.extensions?.code;
    const error = BaseError.normalize(originalError);
    // This text is used to remove duplicated text data
    const textData: string[] = [message, String(error.stack), String(code)];
    const extensions = {
      code,
      stacktrace: error.stack,
    };
    const flatData = flatten<unknown, JsonObject>(error, {
      delimiter: '.',
    });

    // console.log('textData', textData);
    // console.log('error', error);
    // console.log('flatData', flatData);

    for (const [key, value] of Object.entries(flatData)) {
      // console.log({ value, canBeStringified: canBeStringified(value) });
      if (!canBeStringified(value)) continue;
      if (['number', 'bigint'].includes(typeof value)) {
        extensions[key] = value;
        continue;
      }
      const stringValue = String(value);
      if (textData.some(text => text.includes(stringValue))) continue;

      extensions[key] = value;
      textData.push(stringValue);
    }

    const result = {
      message,

      path: castArray(path).join('.'),
      // eslint-disable-next-line perfectionist/sort-objects
      extensions,
    };

    return result;
  };
}

function canBeStringified(value: unknown) {
  if (typeof value === 'object') return false;

  return (
    ['string'].includes(typeof value) ||
    typeof value?.toString === 'function' ||
    typeof value?.valueOf === 'function'
  );
}
