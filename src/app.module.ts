import {
  GlobalExceptionFilter,
  createGraphqlFormatError,
  exceptionFactory,
} from '@/error-utils';
import { TaskModule } from '@/job-task';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { ApolloDriver } from '@nestjs/apollo';
import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import {
  INestApplication,
  Logger,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { useContainer } from 'class-validator';
import { CqrxModule } from 'nestjs-cqrx';
import { NestoLogger } from 'nestolog';
import { AppEnvironment } from './app.environment';
import { RecipeModule } from './recipe/recipe.module'; // import 1
import * as Modules from './modules'; // import 2 (must be imported last)

const GraphQLRootModule = GraphQLModule.forRootAsync({
  driver: ApolloDriver,
  imports: [Modules.Nestolog],
  inject: [Logger],
  useFactory: (logger: Logger) => {
    return {
      autoSchemaFile: '~schema.gql',
      formatError: createGraphqlFormatError({ logger }),
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
          defaultJobOptions: {},
          redis: {
            connectTimeout: 10000,
            keepAlive: 10000,
          },
          url: environment.redisConnectionString,
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

export function configureApp(app: INestApplication) {
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
}
