import { setTimeout } from 'node:timers/promises';

import { Queue } from 'bullmq';
import { ResultOf, TadaDocumentNode, VariablesOf } from 'gql.tada';
import { print } from 'graphql';
import request from 'supertest';

type GraphQLRequestResult<Q> = {
  data: ResultOf<Q>;
  errors?: any[];
  error?: any;
};

export type GraphqlRequestFunction = ReturnType<typeof createGraphqlRequest>;

export function createGraphqlRequest(server) {
  return async function graphqlRequest<
    Q extends TadaDocumentNode<ResultOf<Q>, VariablesOf<Q>>,
  >(query: Q, variables?: VariablesOf<Q>): Promise<GraphQLRequestResult<Q>> {
    const { data, errors } = await request(server)
      .post('/graphql')
      .send({
        query: print(query),
        variables,
      })
      .then(response => response.body);
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
