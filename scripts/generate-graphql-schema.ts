import { writeFileSync } from 'node:fs';

import { ModulesContainer, NestFactory } from '@nestjs/core';
import { GraphQLSchemaFactory, RESOLVER_TYPE_METADATA } from '@nestjs/graphql';
import { printSchema } from 'graphql';

import { AppModule } from '../src/app.module';

generateSchema();

async function generateSchema() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const modules = app.get(ModulesContainer);
  const resolvers = getResolvers(modules);
  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create(resolvers);
  writeFileSync('./~schema.gql', printSchema(schema));
  await app.close();
  console.log('File schema.gql generated');
}

function getResolvers(modules: ModulesContainer) {
  const resolvers = [...modules.values()]
    .flatMap(nestModule => {
      return [...nestModule.providers.values()];
    })
    .map(provider => {
      if (!provider.metatype) return;
      const hasResolver = Reflect.getMetadata(
        RESOLVER_TYPE_METADATA,
        provider.metatype,
      );
      if (hasResolver) {
        return provider.metatype;
      }
    })
    .filter(Boolean);

  return resolvers as Function[];
}
