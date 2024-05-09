import { NestologModule } from 'nestolog';
import { AppEnvironment } from './app.environment';
import { EnvironmentModule } from '@nestjs-steroids/environment';
import { PrismaModule } from '@/nestjs-prisma';

export const Nestolog = NestologModule.register({});
export const Environment = EnvironmentModule.forRoot({
  isGlobal: true,
  loadEnvFile: true,
  useClass: AppEnvironment,
});
export const Prisma = PrismaModule.register({ logQueries: true });
