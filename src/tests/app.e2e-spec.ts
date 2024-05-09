import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { expect } from 'expect';
import { graphql } from 'gql.tada';
import { print } from 'graphql';
import request from 'supertest';
import { AppModule, configureApp } from '../app.module';

let app: INestApplication;
let server: any;

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

after(async () => {
  await app.close();
});
