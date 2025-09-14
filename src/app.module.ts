import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { ApolloDriver } from '@nestjs/apollo';
import { BullModule, BullRootModuleOptions } from '@nestjs/bullmq';
import {
  INestApplication,
  Logger,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { useContainer } from 'class-validator';
import { CqrxModule, EventStoreService } from 'nestjs-cqrx';
import { NestoLogger } from 'nestolog';

import {
  GlobalExceptionFilter,
  createGraphqlFormatError,
  exceptionFactory,
} from '@/errors';
import { TaskModule } from '@/job-task';

import { AppEnvironment } from './app.environment';
import { RecipeModule } from './recipe/recipe.module'; // import 1
// eslint-disable-next-line import-x/order
import * as Modules from './modules'; // import 2 (must be imported last)

const GraphQLRootModule = GraphQLModule.forRootAsync({
  driver: ApolloDriver,
  imports: [Modules.Nestolog],
  inject: [Logger],
  useFactory: () => {
    return {
      autoSchemaFile: '~schema.gql',
      formatError: createGraphqlFormatError(),
      installSubscriptionHandlers: true,
      sortSchema: true,
    };
  },
});

@Module({
  imports: [
    Modules.Nestolog,
    Modules.Environment,
    Modules.Prisma,
    CqrxModule.forRootAsync({
      inject: [AppEnvironment],
      useFactory(environment: AppEnvironment) {
        return {
          eventstoreConnectionString: environment.eventstoreConnectionString,
        };
      },
    }),
    GraphQLRootModule,
    BullModule.forRootAsync({
      imports: [Modules.Environment],
      inject: [AppEnvironment],
      useFactory(environment: AppEnvironment): BullRootModuleOptions {
        return {
          connection: {
            url: environment.redisConnectionString,
          },
          defaultJobOptions: {},
        };
      },
    }),
    BullBoardModule.forRoot({
      adapter: ExpressAdapter,
      route: '/queues',
    }),
    RecipeModule,
    TaskModule,
  ],
})
export class AppModule {}

type ConfigureApp = {
  logEvents?: boolean;
};

export async function configureApplication(
  app: INestApplication,
  options?: ConfigureApp,
) {
  app.enableCors();
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory,
      transform: true,
      validationError: {
        target: false,
      },
    }),
  );
  app.useLogger(app.get(NestoLogger));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  if (options?.logEvents) {
    const logger = new Logger('Event');
    const eventStoreService = app.get(EventStoreService);

    eventStoreService.subscribeToAll(
      event => {
        logger.verbose(event);
      },
      error => {
        logger.error(error);
      },
    );
  }

  await app.init();
}
