import {
  GlobalExceptionFilter,
  exceptionFactory,
} from '@/global-exception-filter';
import { TaskModule } from '@/job-task';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { ApolloDriver } from '@nestjs/apollo';
import { BullModule, BullRootModuleOptions } from '@nestjs/bull';
import {
  BadRequestException,
  INestApplication,
  Logger,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { useContainer } from 'class-validator';
import { GraphQLError } from 'graphql';
import { SevenBoom, formatErrorGenerator } from 'graphql-apollo-errors';
import { CqrxModule } from 'nestjs-cqrx';
import { NestoLogger } from 'nestolog';
import { AppEnvironment } from './app.environment';
import { RecipeModule } from './recipe/recipe.module'; // import 1
import * as Modules from './modules'; // import 2
import { ConduitModule } from './conduit/conduit.module';

const GraphQLRootModule = GraphQLModule.forRootAsync({
  driver: ApolloDriver,
  imports: [Modules.Nestolog],
  inject: [Logger],
  useFactory: (logger: Logger) => {
    const formatError = formatErrorGenerator({
      hideSensitiveData: false,
      logger: logger as any,
      nonBoomTransformer: error => {
        return error instanceof BadRequestException ||
          error instanceof GraphQLError
          ? SevenBoom.badRequest(error as any)
          : SevenBoom.badImplementation(error, { details: error.message });
      },
    });

    return {
      autoSchemaFile: '~schema.gql',
      formatError,
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
