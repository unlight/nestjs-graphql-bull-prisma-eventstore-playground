import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
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

  @OnQueueCompleted()
  async onQueueCompleted(job: Job, result: unknown) {
    const jobId = String(job.id);
    this.logger.log(`${job.name} queue completed ${jobId}`);
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job, error: Error) {
    const jobId = String(job.id);
    this.logger.log(`${job.name} queue failed ${jobId}`);
    this.logger.error(error);
    this.logger.error(error.cause);
  }
}
