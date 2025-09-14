import { getQueueToken } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Queue } from 'bullmq';
import { expect, afterAll, beforeAll, it } from 'vitest';

import { GraphqlRequestFunction, createGraphqlRequest } from '@/test-utils';

import { AppModule, configureApplication } from '../app.module';

let app: INestApplication;
let graphqlRequest: GraphqlRequestFunction;
let queue: Queue;

beforeAll(async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = testingModule.createNestApplication();
  await configureApplication(app, { logEvents: true });
  if (process.env.CI) app.useLogger(false); // Disable all logs in CI

  graphqlRequest = createGraphqlRequest(app.getHttpServer());

  queue = await app.resolve(getQueueToken('recipe'));
  await queue.obliterate();
});

afterAll(async () => {
  await app.close();
});

it('smoke', () => {
  expect(app).toBeTruthy();
});
