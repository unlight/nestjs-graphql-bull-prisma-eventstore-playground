import { Module } from '@nestjs/common';
import { ValidationResolver } from './validation.resolver';

@Module({
  imports: [],
  providers: [ValidationResolver],
})
export class ValidationModule {}
