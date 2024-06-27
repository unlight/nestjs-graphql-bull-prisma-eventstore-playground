import { NotFoundException, OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Queue, Job } from 'bull';
import BullQueue from 'bull/lib/queue';
import { Task, TaskState } from './task.model';
import { JobState } from './types';

@Resolver(() => Task)
export class TaskResolver implements OnModuleInit {
  private queues: Queue[] = [];
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Query(() => Task)
  async task(@Args('id') id: string): Promise<Task> {
    const job = await this.findJobOrFail(id);
    const jobState = await job.getState();
    const state = this.getTaskState(jobState);

    return {
      id: String(job.id),
      state,
    };
  }

  private async findJobOrFail(id: string): Promise<Job> {
    const batchSize = 4;

    for (let index = 0; index < this.queues.length; index = index + batchSize) {
      const queues = this.queues.slice(index, index + batchSize);
      const jobs = await Promise.all(queues.map(queue => queue.getJob(id)));
      const job = jobs.find(Boolean);

      if (job) {
        return job;
      }
    }

    throw new NotFoundException(id);
  }

  private getTaskState(jobState: JobState) {
    switch (jobState) {
      case 'completed':
        return TaskState.SUCCESS;
      case 'failed':
        return TaskState.FAILED;
      default:
        return TaskState.PENDING;
    }
  }

  async onModuleInit() {
    this.queues = this.discoveryService
      .getProviders()
      .filter(provider => provider.instance instanceof BullQueue)
      .map(provider => provider.instance);
  }
}
