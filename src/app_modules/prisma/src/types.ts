import { PrismaClient, Prisma } from '@prisma/client';

type TestDelegate = { findMany: (args: any) => any };
export type PrismaDelegateNames = keyof {
  [P in keyof PrismaClient as PrismaClient[P] extends TestDelegate
    ? P
    : never]: PrismaClient[P];
};
