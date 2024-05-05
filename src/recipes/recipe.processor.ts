import {
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { RecipeService } from './recipe.service';
import { NewRecipeInput } from './dto/new-recipe.input';
import { transformAndValidate } from 'class-transformer-validator';
import { ObjectType } from 'simplytyped';
import { PubSub } from 'graphql-subscriptions';

@Processor('recipe')
export class RecipeProcessor {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly recipeService: RecipeService) {}

  @Process('addRecipe')
  async addRecipe(job: Job<ObjectType<NewRecipeInput>>) {
    const recipeId = job.id.toString();
    // todo: catch validation failed
    const data = await transformAndValidate(NewRecipeInput, job.data);
    await this.recipeService.addRecipe(recipeId, data);
  }

  @OnQueueCompleted()
  onQueueCompleted(job: Job, result: unknown) {}

  @OnQueueFailed()
  onQueueFailed(job: Job, err: Error) {}
}
