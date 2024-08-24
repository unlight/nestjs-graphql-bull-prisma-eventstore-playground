import {
  InjectQueue,
  OnQueueActive,
  OnQueueCompleted,
  OnQueueDrained,
  OnQueueError,
  OnQueueFailed,
  OnQueueStalled,
  OnQueueWaiting,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { ObjectType } from 'simplytyped';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipeService } from './recipe.service';
import { RemoveRecipeInput } from './dto/remove-recipe.input';

@Processor('recipe')
export class RecipeProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly recipeService: RecipeService) {}

  @Process('addRecipe')
  async addRecipe(job: Job<ObjectType<NewRecipeInput>>) {
    const recipeId = job.id.toString();
    await this.recipeService.addRecipe(recipeId, job.data);
  }

  @Process('removeRecipe')
  async removeRecipe(job: Job<ObjectType<RemoveRecipeInput>>) {
    await this.recipeService.removeRecipe(job.data);
  }

  @OnQueueActive()
  async onQueueActive(job: Job) {
    this.logger.verbose(`${job.name} (${job.id}) has started`);
  }

  @OnQueueCompleted()
  async onQueueCompleted(job: Job, result: unknown) {
    const jobId = String(job.id);
    this.logger.verbose(`${job.name} completed ${jobId}`);
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job, error: Error) {
    const jobId = String(job.id);
    this.logger.error(error);
    this.logger.warn(`${job.name} failed ${jobId}`);
  }

  @OnQueueDrained()
  async onQueueDrained() {
    this.logger.verbose(`queue drained`);
  }

  @OnQueueWaiting()
  async onQueueWaiting(jobId: string) {
    this.logger.verbose(`queue ${jobId} waiting`);
  }

  @OnQueueStalled()
  async onQueueStalled(jobId) {
    this.logger.verbose(`queue ${jobId} stalled`);
  }

  @OnQueueError()
  async onQueueError(error, message) {
    if (message) this.logger.error(message);
    this.logger.error(error);
  }
}
