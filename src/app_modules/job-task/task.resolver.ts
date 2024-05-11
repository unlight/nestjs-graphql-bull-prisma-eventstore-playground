import { NotFoundException } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { Queue } from 'bull';
import BullQueue from 'bull/lib/queue';
import { Task, TaskState } from './task.model';

@Resolver(() => Task)
export class TaskResolver {
  private queues: Queue[] = [];
  constructor(private readonly modulesContainer: ModulesContainer) {}

  @Query(() => Task)
  async task(@Args('id') id: string): Promise<Task> {
    const jobs = await Promise.all(this.queues.map(queue => queue.getJob(id)));
    const job = jobs.find(Boolean);

    if (!job) {
      throw new NotFoundException(id);
    }

    const jobState = await job.getState();
    const state = (jobState => {
      switch (jobState) {
        case 'completed':
          return TaskState.SUCCESS;
        case 'failed':
          return TaskState.FAILED;
        default:
          return TaskState.PENDING;
      }
    })(jobState);

    return {
      id: String(job.id),
      state,
    };
  }

  async onModuleInit() {
    this.queues = [...this.modulesContainer.values()]
      .flatMap(nestModule => [...nestModule.providers.values()])
      .map(provider => {
        if (provider.instance instanceof BullQueue) {
          return provider.instance;
        }
      })
      .filter(Boolean) as Queue[];
  }
}
