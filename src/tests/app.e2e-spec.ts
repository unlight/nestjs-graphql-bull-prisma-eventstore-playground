import { GraphqlRequestFunction, createGraphqlRequest } from '@/test-utils';
import { getQueueToken } from '@nestjs/bull';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Queue } from 'bull';
import { expect } from 'expect';
import { graphql } from 'gql.tada';
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

it('add recipe with non uniq code', async () => {
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
      code: '1',
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
