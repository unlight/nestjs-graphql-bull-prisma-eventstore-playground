import {
  GraphqlRequestFunction,
  createGraphqlRequest,
  waitWhenAllJobsFinished,
} from '@/test-utils';
import { getQueueToken } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { expect } from 'expect';
import { VariablesOf, graphql } from 'gql.tada';
import { AppModule, configureApp } from '../app.module';
import { setTimeout } from 'timers/promises';
import { uniqueId } from 'lodash';
import { RecipeService } from '../recipe/recipe.service';

let app: INestApplication;
let graphqlRequest: GraphqlRequestFunction;
let queue: Queue;

before(async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = testingModule.createNestApplication();
  configureApp(app);
  // app.useLogger(false);

  await app.init();
  graphqlRequest = createGraphqlRequest(app.getHttpServer());

  queue = await app.resolve(getQueueToken('recipe'));
  await queue.obliterate();
});

after(async () => {
  await app.close();
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

  const { data, error } = await graphqlRequest(recipesQuery);
});

it('create recipe ok', async () => {
  // Arrange
  const queue: Queue = await app.resolve(getQueueToken('recipe'));
  const service = await app.resolve(RecipeService);
  const createRecipe = graphql(/* GraphQL */ `
    mutation addRecipe($data: NewRecipeInput!) {
      addRecipe(data: $data)
    }
  `);
  const title = uniqueId('title');
  // Act
  const { data, errors } = await graphqlRequest(createRecipe, {
    data: {
      description: null,
      ingredients: [],
      title,
    },
  });
  expect(errors).toBeFalsy();
  await waitWhenAllJobsFinished(queue);
  // Assert
  const recipe = await service.findOneById(data.addRecipe);
  expect(recipe).toEqual(
    expect.objectContaining({ id: data.addRecipe, title }),
  );
});

it('create and remove', async () => {
  // Arrange
  const queue: Queue = await app.resolve(getQueueToken('recipe'));
  const service = await app.resolve(RecipeService);
  const createRecipe = graphql(/* GraphQL */ `
    mutation addRecipe($data: NewRecipeInput!) {
      addRecipe(data: $data)
    }
  `);
  const title = uniqueId('title');
  // Act
  const create = await graphqlRequest(createRecipe, {
    data: {
      ingredients: [],
      title,
    },
  });
  expect(create.errors).toBeFalsy();
  await waitWhenAllJobsFinished(queue);

  const remove = await graphqlRequest(
    graphql(/* GraphQL */ `
      mutation removeRecipe($data: RemoveRecipeInput!) {
        removeRecipe(data: $data)
      }
    `),
    {
      data: {
        id: create.data.addRecipe,
        removeReason: uniqueId('test remove'),
      },
    },
  );
  await waitWhenAllJobsFinished(queue);
  // Assert
  const recipe = await service.findOneById(create.data.addRecipe);
  expect(recipe).toEqual(
    expect.objectContaining({
      isActive: false,
    }),
  );
});

// it.only('revert recipe with non uniq code', async () => {
//   // Arrange
//   const queue: Queue = await app.resolve(getQueueToken('recipe'));
//   const service = await app.resolve(RecipeService);
//   const createRecipe = graphql(/* GraphQL */ `
//     mutation addRecipe($data: NewRecipeInput!) {
//       addRecipe(data: $data)
//     }
//   `);
//   const code = Math.random().toString(36).slice(2);
//   const data = {
//     code: code,
//     title: 'aqew 1',
//   } satisfies VariablesOf<typeof createRecipe>;
//   // Act
//   const [result1, result2] = await Promise.all([
//     graphqlRequest(createRecipe, { data }),
//     graphqlRequest(createRecipe, { data }),
//   ]);
//   await waitWhenAllJobsFinished(queue);
//   // Assert
//   expect(result1.data.addRecipe).toBeTruthy();
//   expect(result2.data.addRecipe).toBeTruthy();
//   const recipe1 = await service.findOneById(result1.data.addRecipe);
//   const recipe2 = await service.findOneById(result2.data.addRecipe);

//   const result = [recipe1, recipe2].filter(Boolean);

//   expect(result[0]).toEqual(expect.objectContaining({ code, isActive: true }));
// });
