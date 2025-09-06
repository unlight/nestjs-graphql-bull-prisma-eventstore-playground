import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { createPrismaQueryEventHandler } from 'prisma-query-log';

import { PRISMA_OPTIONS } from './prisma.providers';

import type { PrismaModuleOptions } from './prisma.providers';

/**
 * Prisma client as nestjs service.
 */
@Injectable()
export class PrismaRepository
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger();

  constructor(@Inject(PRISMA_OPTIONS) options: PrismaModuleOptions) {
    super({
      datasourceUrl: options.datasourceUrl,
      errorFormat: 'minimal',
      log: options.logQueries
        ? [
            {
              emit: 'event',
              level: 'query',
            },
          ]
        : undefined,
    });

    if (options.logQueries) {
      this.$on(
        'query' as never,
        createPrismaQueryEventHandler({
          colorParameter: '\u001B[90m',
          colorQuery: '\u001B[96m',
          format: false,
          logger: query => {
            this.logger.verbose(query, 'PrismaClient');
          },
        }),
      );
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
