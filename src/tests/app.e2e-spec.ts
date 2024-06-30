import {
  GraphqlRequestFunction,
  createGraphqlRequest,
  waitWhenAllJobsFinished,
} from '@/test-utils';
import { getQueueToken } from '@nestjs/bull';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Queue } from 'bull';
import { expect } from 'expect';
import { VariablesOf, graphql } from 'gql.tada';
import { AppModule, configureApp } from '../app.module';
import { RecipeService } from '../recipe/recipe.service';

let app: INestApplication;
let graphqlRequest: GraphqlRequestFunction;

before(async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = testingModule.createNestApplication();
  configureApp(app);
  // app.useLogger(false);

  await app.init();
  graphqlRequest = createGraphqlRequest(app.getHttpServer());
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
  // Act
  const { data, errors } = await graphqlRequest(createRecipe, {
    data: {
      description: null,
      ingredients: [],
      title: 'unrelishing',
    },
  });
  expect(errors).toBeFalsy();
  await queue.whenCurrentJobsFinished();
  // Assert
  const recipe = await service.findOneById(data.addRecipe);
  expect(recipe).toEqual(
    expect.objectContaining({
      id: data.addRecipe,
      title: 'unrelishing',
    }),
  );
});

it.only('create and remove', async () => {
  // Arrange
  const queue: Queue = await app.resolve(getQueueToken('recipe'));
  const service = await app.resolve(RecipeService);
  const createRecipe = graphql(/* GraphQL */ `
    mutation addRecipe($data: NewRecipeInput!) {
      addRecipe(data: $data)
    }
  `);
  // Act
  const { data, errors } = await graphqlRequest(createRecipe, {
    data: {
      description: 'playscript',
      ingredients: [],
      title: 'unfussed',
    },
  });
  expect(errors).toBeFalsy();

  const { data, errors } = await graphqlRequest(
    graphql(/* GraphQL */ `
      mutation removeRecipe($data: RemoveRecipeInput!) {
        removeRecipe(data: $data)
      }
    `),
    { data: { id: '', removeReason: '' } },
  );
  // await waitWhenAllJobsFinished(queue);
  // // Assert
  // const recipe = await service.findOneById(data.addRecipe);
  // expect(recipe).toEqual(
  //   expect.objectContaining({
  //     id: data.addRecipe,
  //     title: 'unrelishing',
  //   }),
  // );
});

it('revert recipe with non uniq code', async () => {
  // Arrange
  const queue: Queue = await app.resolve(getQueueToken('recipe'));
  const service = await app.resolve(RecipeService);
  const createRecipe = graphql(/* GraphQL */ `
    mutation addRecipe($data: NewRecipeInput!) {
      addRecipe(data: $data)
    }
  `);
  const code = Math.random().toString(36).slice(2);
  const data = {
    code: code,
    title: 'aqew 1',
  } satisfies VariablesOf<typeof createRecipe>;
  // Act
  const [result1, result2] = await Promise.all([
    graphqlRequest(createRecipe, { data }),
    graphqlRequest(createRecipe, { data }),
  ]);
  await waitWhenAllJobsFinished(queue);
  // Assert
  expect(result1.data.addRecipe).toBeTruthy();
  expect(result2.data.addRecipe).toBeTruthy();
  const recipe1 = await service.findOneById(result1.data.addRecipe);
  const recipe2 = await service.findOneById(result2.data.addRecipe);

  expect(recipe1).toEqual(expect.objectContaining({ code, isActive: true }));
  expect(recipe2).toEqual(expect.objectContaining({ code, isActive: false }));
});
