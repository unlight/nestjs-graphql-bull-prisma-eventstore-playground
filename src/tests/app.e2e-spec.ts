import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { expect } from 'expect';
import { ResultOf, VariablesOf, graphql } from 'gql.tada';
import { GraphQLError, print } from 'graphql';
import request from 'supertest';
import { AppModule, configureApp } from '../app.module';
import { ErrorPayload, ErrorResult } from 'graphql-apollo-errors';
import { setTimeout } from 'node:timers/promises';
import { InjectQueue, getQueueToken } from '@nestjs/bull';
import { Queue } from 'bull';
import { RecipeService } from '../recipe/recipe.service';
import { Recipe } from '../recipe/recipe.providers';

let app: INestApplication;
let server: any;

type GraphQLResult<D> = {
  data: ResultOf<D>;
  errors?: ErrorPayload[];
};

before(async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = testingModule.createNestApplication();
  configureApp(app);
  // app.useLogger(false);

  await app.init();
  server = app.getHttpServer();
});

it('smoke', () => {
  expect(app).toBeTruthy();
});

it('read recipes', async () => {
  const recipesQuery = graphql(/* GraphQL */ `
    query {
      recipes {
        id
      }
    }
  `);

  const result = await request(server)
    .post('/graphql')
    .send({
      query: print(recipesQuery),
      variables: {},
    })
    .expect(200)
    .then(response => response.body.data);
});

it('create recipe ok', async () => {
  const queue: Queue = await app.resolve(getQueueToken('recipe'));
  const service = await app.resolve(RecipeService);
  const createRecipe = graphql(/* GraphQL */ `
    mutation addRecipe($data: NewRecipeInput!) {
      addRecipe(data: $data)
    }
  `);
  type Variables = VariablesOf<typeof createRecipe>;
  const { data, errors }: GraphQLResult<typeof createRecipe> = await request(
    server,
  )
    .post('/graphql')
    .send({
      query: print(createRecipe),
      variables: {
        data: {
          description: null,
          ingredients: [],
          title: 'unrelishing',
        },
      } satisfies VariablesOf<typeof createRecipe>,
    })
    .then(response => response.body);

  expect(errors).toBeFalsy();

  await queue.whenCurrentJobsFinished();

  const recipe = await service.findOneById(data.addRecipe);
  expect(recipe).toEqual(
    expect.objectContaining({
      id: data.addRecipe,
      title: 'unrelishing',
    }),
  );
});

after(async () => {
  await app.close();
});
