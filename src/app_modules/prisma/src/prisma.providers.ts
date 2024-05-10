import { ModuleMetadata, Provider, Type } from '@nestjs/common';

export const PRISMA_OPTIONS = Symbol('PRISMA_OPTIONS');

export const defaultPrismaOptions = {
  datasourceUrl: undefined as string | undefined,
  logQueries: false,
};

export type PrismaModuleOptions = Partial<typeof defaultPrismaOptions>;

export interface PrismaOptionsFactory {
  createPrismaOptions(): Partial<PrismaModuleOptions>;
}

export interface PrismaModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useClass?: Type<PrismaOptionsFactory>;
  useExisting?: Type<PrismaOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<Partial<PrismaModuleOptions>> | Partial<PrismaModuleOptions>;
  inject?: any[];
}

export function createAsyncProviders(
  options: PrismaModuleAsyncOptions,
): Provider[] {
  if (options.useFactory || options.useExisting) {
    return [createAsyncOptionsProvider(options)];
  }

  const useClass = options.useClass as Type<PrismaOptionsFactory>;
  return [
    createAsyncOptionsProvider(options),
    {
      provide: useClass,
      useClass,
    },
  ];
}

export function createAsyncOptionsProvider(
  options: PrismaModuleAsyncOptions,
): Provider {
  if (options.useFactory) {
    return {
      inject: options.inject || [],
      provide: PRISMA_OPTIONS,
      useFactory: async (...args: any[]) => {
        // eslint-disable-next-line sonarjs/prefer-immediate-return
        const result = {
          ...defaultPrismaOptions,
          ...(options.useFactory && (await options.useFactory(...args))),
        };
        return result;
      },
    };
  }

  return {
    inject: [
      (options.useClass || options.useExisting) as Type<PrismaOptionsFactory>,
    ],
    provide: PRISMA_OPTIONS,
    useFactory: (factory: PrismaOptionsFactory) =>
      factory.createPrismaOptions(),
  };
}
