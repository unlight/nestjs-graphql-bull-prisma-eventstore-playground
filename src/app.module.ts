import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ApolloDriver } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';
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
import { RecipeModule } from './recipe/recipe.module';
import {
  GlobalExceptionFilter,
  exceptionFactory,
} from '@/global-exception-filter';
import { AppEnvironment } from './app.environment';
import * as Modules from './modules';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';

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
      useFactory(environment: AppEnvironment) {
        return {
          url: environment.redisConnectionString,
        };
      },
    }),
    BullBoardModule.forRoot({
      adapter: ExpressAdapter,
      route: '/queues',
    }),
    BullBoardModule.forFeature({
      adapter: BullAdapter,
      name: 'recipe',
    }),
    RecipeModule,
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
