import {
  GraphqlRequestFunction,
  createGraphqlRequest,
  waitWhenAllJobsFinished,
} from '@/test-utils';
import { getQueueToken } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { randomInt } from 'crypto';
import { expect } from 'expect';
import { VariablesOf, graphql } from 'gql.tada';
import { uniqueId } from 'lodash';
import { AppModule, configureApp } from '../app.module';
import { RecipeFinder } from '../recipe/recipe.finder';

let app: INestApplication;
let graphqlRequest: GraphqlRequestFunction;
let queue: Queue;

before(async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = testingModule.createNestApplication();
  configureApp(app, { logEvents: true });
  // app.useLogger(false); // Disable all logs

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
  const recipesQuery = graphql(`
    query getRecipe {
      recipes {
        id
      }
    }
  `);

  const { data, error } = await graphqlRequest(recipesQuery);

  expect(error).toBeFalsy();
});

it('create recipe ok', async () => {
  // Arrange
  const service = await app.resolve(RecipeFinder);
  const createRecipe = graphql(`
    mutation addRecipe($data: NewRecipeInput!) {
      addRecipe(data: $data)
    }
  `);
  const title = uniqueId('title');
  // Act
  const { data, errors } = await graphqlRequest(createRecipe, {
    data: {
      code: uniqueId('code' + randomInt(999_999_999)),
      description: uniqueId('description' + '_'.repeat(25)),
      title,
    },
  });
  expect(errors).toBeFalsy();
  await waitWhenAllJobsFinished(queue);

  const task = await graphqlRequest(
    graphql(`
      query GetTask($id: String!) {
        task(id: $id) {
          id
          state
          failedReason
        }
      }
    `),
    { id: data.addRecipe },
  );

  expect(task.error).toBeFalsy();

  // Assert
  const recipe = await service.findOneById(data.addRecipe);
  expect(recipe).toEqual(
    expect.objectContaining({ id: data.addRecipe, title }),
  );
});

it('create and remove', async () => {
  // Arrange
  const service = await app.resolve(RecipeFinder);
  const createRecipe = graphql(`
    mutation addRecipe($data: NewRecipeInput!) {
      addRecipe(data: $data)
    }
  `);
  const title = uniqueId('title');
  // Act
  const create = await graphqlRequest(createRecipe, {
    data: {
      code: uniqueId('code' + randomInt(999_999_999)),
      description: uniqueId('description' + '_'.repeat(25)),
      title,
    },
  });
  expect(create.errors).toBeFalsy();
  await waitWhenAllJobsFinished(queue);

  const remove = await graphqlRequest(
    graphql(`
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
  expect(remove.error).toBeFalsy();

  await waitWhenAllJobsFinished(queue);
  // Assert
  const recipe = await service.findOneById(create.data.addRecipe);
  expect(recipe).toEqual(
    expect.objectContaining({
      isActive: false,
    }),
  );
});

it('revert recipe with non uniq code', async () => {
  // Arrange
  const service = await app.resolve(RecipeFinder);
  const addRecipe = graphql(`
    mutation addRecipe($data: NewRecipeInput!) {
      addRecipe(data: $data)
    }
  `);
  const code = Math.random().toString(36).slice(2);
  const data: VariablesOf<typeof addRecipe>['data'] = {
    code: code,
    title: 'aqew 1',
  };
  // Act
  const [result1, result2] = await Promise.all([
    graphqlRequest(addRecipe, { data }),
    graphqlRequest(addRecipe, { data }),
  ]);
  await waitWhenAllJobsFinished(queue);
  // Assert
  expect(result1.data.addRecipe).toBeTruthy();
  expect(result2.data.addRecipe).toBeTruthy();
  const recipe1 = await service.findOneById(result1.data.addRecipe);
  const recipe2 = await service.findOneById(result2.data.addRecipe);

  const result = [recipe1, recipe2].filter(Boolean);

  expect(result[0]).toEqual(expect.objectContaining({ code, isActive: true }));
});
