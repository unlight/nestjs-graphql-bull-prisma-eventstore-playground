import { NestFactory } from '@nestjs/core';
import { NestoLogger } from 'nestolog';

import { AppEnvironment } from './app.environment';
import { AppModule, configureApplication } from './app.module';

NestFactory.create(AppModule, { logger: NestoLogger.create() })
  .then(async app => {
    await configureApplication(app);

    const appEnvironment = app.get(AppEnvironment);
    await app.listen(appEnvironment.port);
  })
  .catch(error => {
    throw error;
  });
