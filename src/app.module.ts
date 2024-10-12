import {
  GlobalExceptionFilter,
  createGraphqlFormatError,
  exceptionFactory,
} from '@/errors';
import { TaskModule } from '@/job-task';
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
import { AppEnvironment } from './app.environment';
import { RecipeModule } from './recipe/recipe.module'; // import 1
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
          eventstoreDbConnectionString:
            environment.eventstoreDbConnectionString,
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
            host: 'localhost',
            port: 6379,
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

export function configureApp(app: INestApplication, options?: ConfigureApp) {
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

    const unsubscribe = eventStoreService.subscribeToAll(event => {
      logger.verbose(event);
    });
  }
}
