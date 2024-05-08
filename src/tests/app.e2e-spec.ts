import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { expect } from 'expect';
import { AppModule, configureApp } from '../app.module';

// eslint-disable-next-line unicorn/prevent-abbreviations
let app: INestApplication;

before(async () => {
  const testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  app = testingModule.createNestApplication();
  configureApp(app);
  // app.useLogger(false);

  await app.init();
});

it('smoke', () => {
  expect(app).toBeTruthy();
});

after(async () => {
  await app.close();
});
