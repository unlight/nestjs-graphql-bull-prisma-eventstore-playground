import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ObjectType } from 'simplytyped';
import { AddRecipeUseCase } from './add-recipe.usecase';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RemoveRecipeInput } from './dto/remove-recipe.input';
import { RemoveRecipeUseCase } from './remove-recipe.usecase';

type AddRecipeJob = Job<ObjectType<NewRecipeInput>, void, 'addRecipe'>;
type RemoveRecipeJob = Job<ObjectType<RemoveRecipeInput>, void, 'removeRecipe'>;
type Jobs = AddRecipeJob | RemoveRecipeJob;

@Processor('recipe')
export class RecipeProcessor extends WorkerHost {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly addUseCase: AddRecipeUseCase,
    private readonly removeUseCase: RemoveRecipeUseCase,
  ) {
    super();
  }

  async process(job: Jobs): Promise<unknown> {
    switch (job.name) {
      case 'addRecipe':
        return this.addRecipe(job);
      case 'removeRecipe':
        return this.removeRecipe(job);
    }
  }

  private async addRecipe(job: Job<ObjectType<NewRecipeInput>>) {
    const recipeId = job.id!;
    await this.addUseCase.execute(recipeId, job.data);
  }

  private async removeRecipe(job: Job<ObjectType<RemoveRecipeInput>>) {
    await this.removeUseCase.execute(job.data);
  }

  @OnWorkerEvent('active')
  onWorkerActive(job: Job) {
    this.logger.verbose(`${job.name} (${job.id}) has started`);
  }

  @OnWorkerEvent('completed')
  onWorkerCompleted(job: Job, result: unknown, previous: string) {
    this.logger.verbose(`${job.name} completed ${job.id}`);
  }

  @OnWorkerEvent('drained')
  onWorkerDrained() {
    this.logger.verbose('drained');
  }

  @OnWorkerEvent('error')
  onWorkerError(error: Error) {
    this.logger.error(error);
  }

  @OnWorkerEvent('failed')
  onWorkerFailed(job: Job, error: Error, previous: string) {
    this.logger.warn(`${job.name} failed ${job.id}`);
    this.logger.error(error);
  }

  @OnWorkerEvent('paused')
  onWorkerPaused() {
    this.logger.verbose('paused');
  }

  @OnWorkerEvent('progress')
  onWorkerProgress(job: Job, progress: number | object) {
    this.logger.verbose('progress');
  }

  @OnWorkerEvent('ready')
  onWorkerReady() {
    this.logger.verbose(`${this.worker.name} is ready`);
  }

  @OnWorkerEvent('resumed')
  onWorkerResumed() {
    this.logger.verbose(`${this.worker.name} is resumed`);
  }

  @OnWorkerEvent('stalled')
  onWorkerStalled(jobId: string, previous: string) {
    this.logger.verbose(`job ${jobId} stalled`);
  }
}
