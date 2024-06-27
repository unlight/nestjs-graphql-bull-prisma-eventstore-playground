import { Module } from '@nestjs/common';
import { TaskResolver } from './task.resolver';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [DiscoveryModule],
  providers: [TaskResolver],
})
export class TaskModule {}
