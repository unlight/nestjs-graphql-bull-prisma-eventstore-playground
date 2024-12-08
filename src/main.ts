import { NestFactory } from '@nestjs/core';
import { AppEnvironment } from './app.environment';
import { AppModule, initializeApplication } from './app.module';
import { NestoLogger } from 'nestolog';

const logger = new NestoLogger({} as any);

NestFactory.create(AppModule, { logger })
  .then(async app => {
    await initializeApplication(app);

    const appEnvironment = app.get(AppEnvironment);
    await app.listen(appEnvironment.port);
  })
  .catch(error => {
    throw error;
  });
