import { NestFactory } from '@nestjs/core';
import { AppEnvironment } from './app.environment';
import { AppModule, initializeApplication } from './app.module';
import { NestoLogger } from 'nestolog';

NestFactory.create(AppModule, { logger: NestoLogger.create() })
  .then(async app => {
    await initializeApplication(app);

    const appEnvironment = app.get(AppEnvironment);
    await app.listen(appEnvironment.port);
  })
  .catch(error => {
    throw error;
  });
