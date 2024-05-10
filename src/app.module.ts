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

const GraphQLRootModule = GraphQLModule.forRootAsync({
  imports: [Modules.Nestolog],
  driver: ApolloDriver,
  inject: [Logger],
  useFactory: (logger: Logger) => {
    const formatError = formatErrorGenerator({
      logger: logger as any,
      hideSensitiveData: false,
      nonBoomTransformer: error => {
        return error instanceof BadRequestException ||
          error instanceof GraphQLError
          ? SevenBoom.badRequest(error as any)
          : SevenBoom.badImplementation(error, { details: error.message });
      },
    });

    return {
      autoSchemaFile: '~schema.gql',
      sortSchema: true,
      installSubscriptionHandlers: true,
      formatError,
    };
  },
});

@Module({
  imports: [
    Modules.Nestolog,
    Modules.Environment,
    Modules.Prisma,
    CqrxModule.forRootAsync({
      useFactory(environment: AppEnvironment) {
        return {
          eventstoreDbConnectionString:
            environment.eventstoreDbConnectionString,
        };
      },
      inject: [AppEnvironment],
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
    RecipeModule,
  ],
})
export class AppModule {}

export function configureApp(app: INestApplication) {
  app.enableCors();
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      validationError: {
        target: false,
      },
      exceptionFactory,
    }),
  );
  app.useLogger(app.get(NestoLogger));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
}
