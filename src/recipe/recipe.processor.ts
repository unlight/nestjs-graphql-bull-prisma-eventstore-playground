import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ObjectType } from 'simplytyped';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RemoveRecipeInput } from './dto/remove-recipe.input';
import { RecipeService } from './recipe.service';

@Processor('recipe')
export class RecipeProcessor extends WorkerHost {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly recipeService: RecipeService) {
    super();
  }

  async process(
    job: Job<any, any, 'addRecipe' | 'removeRecipe'>,
  ): Promise<any> {
    switch (job.name) {
      case 'addRecipe':
        return this.addRecipe(job);
      case 'removeRecipe':
        return this.removeRecipe(job);
    }
  }

  async addRecipe(job: Job<ObjectType<NewRecipeInput>>) {
    const recipeId = job.id!;
    await this.recipeService.addRecipe(recipeId, job.data);
  }

  async removeRecipe(job: Job<ObjectType<RemoveRecipeInput>>) {
    await this.recipeService.removeRecipe(job.data);
  }

  @OnWorkerEvent('active')
  async onWorkerActive(job: Job) {
    this.logger.verbose(`${job.name} (${job.id}) has started`);
  }

  @OnWorkerEvent('completed')
  async onWorkerCompleted(job: Job, result: unknown, previous: string) {
    this.logger.verbose(`${job.name} completed ${job.id}`);
  }

  @OnWorkerEvent('drained')
  async onWorkerDrained() {
    this.logger.verbose('drained');
  }

  @OnWorkerEvent('error')
  async onWorkerError(error: Error) {
    this.logger.error(error);
  }

  @OnWorkerEvent('failed')
  async onWorkerFailed(job: Job, error: Error, previous: string) {
    this.logger.error(error);
    this.logger.warn(`${job.name} failed ${job.id}`);
  }

  @OnWorkerEvent('paused')
  async onWorkerPaused() {
    this.logger.verbose('paused');
  }

  @OnWorkerEvent('progress')
  async onWorkerProgress(job: Job, progress: number | object) {
    this.logger.verbose('progress');
  }

  @OnWorkerEvent('ready')
  async onWorkerReady() {
    this.logger.verbose(`${this.worker.name} is ready`);
  }

  @OnWorkerEvent('resumed')
  async onWorkerResumed() {
    this.logger.verbose(`${this.worker.name} is resumed`);
  }

  @OnWorkerEvent('stalled')
  async onWorkerStalled(jobId: string, previous: string) {
    this.logger.verbose(`job ${jobId} stalled`);
  }
}
