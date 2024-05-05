import { InjectQueue } from '@nestjs/bull';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe } from './models/recipe.model';
import { RecipeService } from './recipe.service';
import { NotFoundException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Queue } from 'bull';
import { createId } from '@paralleldrive/cuid2';
import { ObjectType } from 'simplytyped';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => Recipe)
export class RecipeResolver {
  constructor(
    @InjectQueue('recipe') private queue: Queue,
    private readonly recipeService: RecipeService,
    private readonly pubSub: PubSub,
  ) {}

  @Query(() => Recipe)
  async recipe(@Args('id') id: string): Promise<Recipe> {
    const recipe = await this.recipeService.findOneById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }

  @Query(() => [Recipe])
  recipes(@Args() recipesArgs: RecipesArgs): Promise<Recipe[]> {
    return this.recipeService.findAll(recipesArgs);
  }

  @Mutation(() => String)
  async addRecipe(
    @Args('newRecipeData') newRecipeData: NewRecipeInput,
  ): Promise<String> {
    const job = await this.queue.add('addRecipe', newRecipeData, {
      jobId: createId(),
    });
    return String(job.id);
  }

  @Mutation(() => Boolean)
  async removeRecipe(@Args('id') id: string) {
    return this.recipeService.remove(id);
  }

  @Subscription(() => Recipe)
  recipeAdded() {
    return this.pubSub.asyncIterator('recipeAdded');
  }
}
