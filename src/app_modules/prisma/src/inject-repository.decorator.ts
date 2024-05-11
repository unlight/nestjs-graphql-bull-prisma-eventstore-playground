import { PrismaRepository } from './prisma.repository';
import { Inject } from '@nestjs/common';
import { PrismaDelegateNames } from './types';

const prismaRepositories = new Set<PrismaDelegateNames>();

export function createRepositoryProviers() {
  return [...prismaRepositories].map(name => {
    return {
      inject: [PrismaRepository],
      provide: getRepositoryToken(name),
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
