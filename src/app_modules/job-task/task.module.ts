import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { TaskResolver } from './task.resolver';

@Module({
  imports: [DiscoveryModule],
  providers: [TaskResolver],
})
export class TaskModule {}
