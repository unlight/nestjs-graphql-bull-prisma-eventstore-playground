import { NestFactory } from '@nestjs/core';
import { AppEnvironment } from './app.environment';
import { AppModule, configureApplication } from './app.module';
import { NestoLogger } from 'nestolog';

NestFactory.create(AppModule, { logger: NestoLogger.create() })
  .then(async app => {
    await configureApplication(app);

    const appEnvironment = app.get(AppEnvironment);
    await app.listen(appEnvironment.port);
  })
  .catch(error => {
    throw error;
  });
