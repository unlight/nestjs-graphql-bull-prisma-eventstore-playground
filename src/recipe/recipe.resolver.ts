import { InjectQueue } from '@nestjs/bullmq';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe } from './recipe.model';
import { NotFoundException, OnModuleDestroy } from '@nestjs/common';
import {
  Args,
  Info,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { Queue } from 'bullmq';
import { createId } from '@paralleldrive/cuid2';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLResolveInfo } from 'graphql';
import { PrismaSelect } from '@paljs/plugins';
import { RemoveRecipeInput } from './dto/remove-recipe.input';
import { RecipeService } from './recipe.service';

@Resolver(() => Recipe)
export class RecipeResolver implements OnModuleDestroy {
  constructor(
    @InjectQueue('recipe') private queue: Queue,
    private readonly service: RecipeService,
    private readonly pubSub: PubSub,
  ) {}

  @Query(() => Recipe)
  async recipe(
    @Args('id') id: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Recipe> {
    const select = new PrismaSelect(info).value.select;
    // console.log('select', select);

    const recipe = await this.service.findOneById(id);
    if (!recipe) {
      throw new NotFoundException(id);
    }
    return recipe;
  }

  @Query(() => [Recipe])
  recipes(@Args() recipesArgs: RecipesArgs): Promise<Recipe[]> {
    return this.service.findAll(recipesArgs);
  }

  @Mutation(() => String)
  async addRecipe(@Args('data') data: NewRecipeInput): Promise<string> {
    const job = await this.queue.add('addRecipe', data, {
      jobId: createId(),
    });
    return String(job.id);
  }

  @Mutation(() => String)
  async removeRecipe(@Args('data') data: RemoveRecipeInput): Promise<string> {
    const job = await this.queue.add('removeRecipe', data);
    return String(job.id);
  }

  @Subscription(() => Recipe)
  recipeAdded() {
    return this.pubSub.asyncIterator('recipeAdded');
  }

  async onModuleDestroy() {
    await this.queue.close();
  }
}
