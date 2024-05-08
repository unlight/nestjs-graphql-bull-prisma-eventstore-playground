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
}
