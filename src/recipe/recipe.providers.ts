import { Prisma, PrismaClient } from '@prisma/client';
import { InjectRepository, PrismaRepository } from '@/nestjs-prisma';
import { RecipeAggregate } from './recipe.aggregate';
import * as cqrx from 'nestjs-cqrx';

const name = 'recipe';
type name = typeof name;

export type ViewRepository = PrismaRepository[name];
export type ProjectionRepository = PrismaRepository[name];

export function InjectViewRepository() {
  return InjectRepository(name);
}

export type AggregateRepository = cqrx.AggregateRepository<RecipeAggregate>;

export function InjectAggregateRepository() {
  return cqrx.InjectAggregateRepository(RecipeAggregate);
}

type T = PrismaClient[name];
type CreateDataArgument = Prisma.Args<T, 'create'>['data'];
export type CreateResult = Prisma.Result<T, CreateDataArgument, 'create'>;
