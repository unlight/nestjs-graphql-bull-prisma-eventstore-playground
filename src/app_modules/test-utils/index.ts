import { setTimeout } from 'node:timers/promises';

import { Queue } from 'bullmq';
import { ResultOf, TadaDocumentNode, VariablesOf } from 'gql.tada';
import { GraphQLError, print } from 'graphql';
import request from 'supertest';
import { App } from 'supertest/types';

type GraphQLRequestResult<Q> = {
  data?: ResultOf<Q> | null;
  errors?: GraphQLError[];
  error?: GraphQLError;
};

export type GraphqlRequestFunction = ReturnType<typeof createGraphqlRequest>;

interface GraphqlResponse {
  errors?: GraphQLError[];
  data: any;
  extensions?: any;
}

export function createGraphqlRequest(server: App) {
  return async function graphqlRequest<
    Q extends TadaDocumentNode<ResultOf<Q>, VariablesOf<Q>>,
  >(query: Q, variables?: VariablesOf<Q>): Promise<GraphQLRequestResult<Q>> {
    const response = await request(server)
      .post('/graphql')
      .send({
        query: print(query),
        variables,
      });
    const { data, errors } = response.body as GraphqlResponse;

    return { data, error: errors?.[0], errors };
  };
}

export async function waitWhenAllJobsFinished(queue: Queue) {
  while (true) {
    await setTimeout(100);
    if (await queue.getActiveCount()) continue;
    if (await queue.getWaitingCount()) continue;
    if (await queue.getWaitingChildrenCount()) continue;

    break;
  }
}
