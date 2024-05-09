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

@Processor('recipe')
export class RecipeProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly recipeService: RecipeService) {}

  @Process('addRecipe')
  async addRecipe(job: Job<ObjectType<NewRecipeInput>>) {
    const recipeId = job.id.toString();
    await this.recipeService.addRecipe(recipeId, job.data);
  }

  @OnQueueCompleted()
  async onQueueCompleted(job: Job, result: unknown) {
    console.log('onQueueCompleted', 1);
    const id = String(job.id);
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job, err: Error) {
    this.logger.error(err);
    const id = String(job.id);
  }
}
