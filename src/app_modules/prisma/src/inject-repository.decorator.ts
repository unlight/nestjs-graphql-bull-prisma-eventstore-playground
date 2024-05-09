import { PrismaRepository } from './prisma.repository';
import { Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prismaRepositories = new Set<PrismaDelegateNames>();

export function createRepositoryProviers() {
  return [...prismaRepositories].map(name => {
    return {
      provide: getRepositoryToken(name),
      inject: [PrismaRepository],
      useFactory: (prisma: PrismaRepository) => prisma[name],
    };
  });
}

export function getRepositoryToken(name: PrismaDelegateNames) {
  return `PrismaRepository_${name}`;
}

/**
 * Example:
 * @InjectRepository('user') repository: PrismaRepository['user'] or PrismaClient['user']
 */
export function InjectRepository(name: PrismaDelegateNames) {
  prismaRepositories.add(name);
  return Inject(getRepositoryToken(name));
}

type TestDelegate = { findMany: (args: any) => any };
type PrismaDelegateNames = keyof {
  [P in keyof PrismaClient as PrismaClient[P] extends TestDelegate
    ? P
    : never]: PrismaClient[P];
};
