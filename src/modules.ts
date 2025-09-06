import { EnvironmentModule } from '@nestjs-steroids/environment';
import { NestologModule } from 'nestolog';

import { PrismaModule } from '@/nestjs-prisma';

import { AppEnvironment } from './app.environment';

export const Nestolog = NestologModule.register({});
export const Environment = EnvironmentModule.forRoot({
  isGlobal: true,
  loadEnvFile: true,
  useClass: AppEnvironment,
});
export const Prisma = PrismaModule.register({ logQueries: true });
