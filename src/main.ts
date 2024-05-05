import { AppModule, configureApp } from './app.module';
import { NestFactory } from '@nestjs/core';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
NestFactory.create(AppModule).then(async app => {
  configureApp(app);
  await app.init();
  await app.listen(3000);
});
