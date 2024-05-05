import { PrismaModule } from '@/nestjs-prisma';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';
import {
  BadRequestException,
  Global,
  INestApplication,
  Logger,
  Module,
} from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { useContainer } from 'class-validator';
import { GraphQLError } from 'graphql';
import { SevenBoom, formatErrorGenerator } from 'graphql-apollo-errors';
import { CqrxModule } from 'nestjs-cqrx';
import { NestoLogger, NestologModule } from 'nestolog';

@Global()
@Module({
  imports: [
    PrismaModule.register({ logQueries: true }),
    CqrxModule.forRoot({
      eventstoreDbConnectionString: `esdb://localhost:2113?tls=false`,
    }),
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      inject: [Logger],
      useFactory: graphqlModuleFactory,
    }),
    NestologModule.forRoot(),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  providers: [Logger],
  exports: [Logger],
})
export class AppModule {}

function graphqlModuleFactory(logger: Logger): ApolloDriverConfig {
  return {
    autoSchemaFile: '~schema.gql',
    sortSchema: true,
    installSubscriptionHandlers: true,
    formatError: formatErrorGenerator({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      logger: logger as any,
      hideSensitiveData: false,
      nonBoomTransformer: error => {
        return error instanceof BadRequestException ||
          error instanceof GraphQLError
          ? SevenBoom.badRequest(error as any)
          : SevenBoom.badImplementation(error);
      },
    }),
  };
}

export function configureApp(app: INestApplication) {
  app.enableCors();
  // Do async validation
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     validationError: {
  //       target: false,
  //     },
  //   }),
  // );

  app.useLogger(app.get(NestoLogger));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
}
