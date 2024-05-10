import { ResultOf, TadaDocumentNode, VariablesOf } from 'gql.tada';
import { print } from 'graphql';
import { ErrorPayload } from 'graphql-apollo-errors';
import request from 'supertest';

type GraphQLRequestResult<Q> = {
  data: ResultOf<Q>;
  errors?: ErrorPayload[];
  error?: ErrorPayload;
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
    return { data, errors, error: errors?.[0] };
  };
}
