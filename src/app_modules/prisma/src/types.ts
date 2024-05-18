import { PrismaClient } from '@prisma/client';

type TestDelegate = { findMany: (args: any) => any };
export type PrismaDelegateNames = keyof {
  [P in keyof PrismaClient as PrismaClient[P] extends TestDelegate
    ? P
    : never]: PrismaClient[P];
};

// export namespace Recipe {
//   export type ViewRepository = PrismaRepository['recipe'];

//   export function InjectViewRepository() {
//     return InjectRepository('recipe');
//   }

//   export type AggregateRepository = cqrx.AggregateRepository<RecipeAggregate>;

//   export function InjectAggregateRepository() {
//     return cqrx.InjectAggregateRepository(RecipeAggregate);
//   }

//   type T = PrismaClient['recipe'];
//   type CreateDataArgument = Prisma.Args<T, 'create'>['data'];
//   export type CreateResult = Prisma.Result<T, CreateDataArgument, 'create'>;
// }
