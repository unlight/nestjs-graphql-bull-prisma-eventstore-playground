import { Prisma, PrismaClient } from '@prisma/client';
import { InjectRepository, PrismaRepository } from '@/nestjs-prisma';
import { Recipe as RecipeAggregate } from './recipe.aggregate';
import * as cqrx from 'nestjs-cqrx';

export namespace Recipe {
  export type ViewRepository = PrismaRepository['recipe'];

  export function InjectViewRepository() {
    return InjectRepository('recipe');
  }

  export type AggregateRepository = cqrx.AggregateRepository<RecipeAggregate>;

  export function InjectAggregateRepository() {
    return cqrx.InjectAggregateRepository(RecipeAggregate);
  }

  type T = PrismaClient['recipe'];
  type CreateDataArgument = Prisma.Args<T, 'create'>['data'];
  export type CreateResult = Prisma.Result<T, CreateDataArgument, 'create'>;
}
