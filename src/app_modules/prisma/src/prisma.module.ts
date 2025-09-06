import { DynamicModule, Module } from '@nestjs/common';

import { createRepositoryProviers } from './inject-repository.decorator';
import {
  PRISMA_OPTIONS,
  createAsyncProviders,
  defaultPrismaOptions,
} from './prisma.providers';
import { PrismaRepository } from './prisma.repository';

import type {
  PrismaModuleAsyncOptions,
  PrismaModuleOptions,
} from './prisma.providers';

@Module({})
export class PrismaModule {
  static register(options: PrismaModuleOptions = {}): DynamicModule {
    const repositoryProviers = createRepositoryProviers();
    options = { ...defaultPrismaOptions, ...options };
    return {
      exports: [...repositoryProviers, PrismaRepository],
      module: PrismaModule,
      providers: [
        {
          provide: PRISMA_OPTIONS,
          useValue: options,
        },
        PrismaRepository,
        ...repositoryProviers,
      ],
    };
  }

  static registerAsync(options: PrismaModuleAsyncOptions): DynamicModule {
    const repositoryProviers = createRepositoryProviers();
    return {
      exports: [...repositoryProviers, PrismaRepository],
      imports: options.imports || [],
      module: PrismaModule,
      providers: [
        ...createAsyncProviders(options),
        ...repositoryProviers,
        PrismaRepository,
      ],
    };
  }
}
