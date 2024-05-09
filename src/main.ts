import { NestFactory } from '@nestjs/core';
import { AppEnvironment } from './app.environment';
import { AppModule, configureApp } from './app.module';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
NestFactory.create(AppModule).then(async app => {
  configureApp(app);
  await app.init();

  const appEnvironment = app.get(AppEnvironment);
  await app.listen(appEnvironment.port);
});
