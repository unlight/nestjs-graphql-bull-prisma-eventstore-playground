import { InjectQueue } from '@nestjs/bull';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe } from './models/recipe.model';
import { RecipeService } from './recipe.service';
import { NotFoundException } from '@nestjs/common';
import {
  Args,
  Info,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { Queue } from 'bull';
import { createId } from '@paralleldrive/cuid2';
import { PubSub } from 'graphql-subscriptions';
import { GraphQLResolveInfo } from 'graphql';
import { PrismaSelect } from '@paljs/plugins';

@Resolver(() => Recipe)
export class RecipeResolver {
  constructor(
    @InjectQueue('recipe') private queue: Queue,
    private readonly recipeService: RecipeService,
    private readonly pubSub: PubSub,
  ) {}

  @Query(() => Recipe)
  async recipe(
    @Args('id') id: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Recipe> {
    const select = new PrismaSelect(info).value.select;
    // console.log('select', select);

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
  async addRecipe(@Args('data') data: NewRecipeInput): Promise<String> {
    const job = await this.queue.add('addRecipe', data, {
      jobId: createId(),
    });
    return String(job.id);
  }

  // @Mutation(() => Boolean)
  // async removeRecipe(@Args('id') id: string) {
  //   return this.recipeService.remove(id);
  // }

  @Subscription(() => Recipe)
  recipeAdded() {
    return this.pubSub.asyncIterator('recipeAdded');
  }
}
