import { InjectQueue } from '@nestjs/bullmq';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe } from './recipe.model';
import {
  BadRequestException,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
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
import { RecipeFinder } from './recipe.finder';
import { transformAndValidate } from 'class-transformer-validator';
import { UnknownError } from '@/errors';
import { ADD_RECIPE, QUEUE_NAME, REMOVE_RECIPE } from './recipe.constants';

@Resolver(() => Recipe)
export class RecipeResolver implements OnModuleDestroy {
  constructor(
    @InjectQueue(QUEUE_NAME) private queue: Queue,
    private readonly service: RecipeFinder,
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
    const job = await this.queue.add(ADD_RECIPE, data, {
      jobId: createId(),
    });
    return String(job.id);
  }

  @Mutation(() => String)
  async removeRecipe(@Args('data') data: RemoveRecipeInput): Promise<string> {
    const job = await this.queue.add(REMOVE_RECIPE, data);
    return String(job.id);
  }

  @Query(() => Recipe)
  error404(): Promise<Recipe> {
    throw new NotFoundException('dummy');
  }

  @Query(() => Recipe)
  async error400(): Promise<Recipe> {
    const errors = await transformAndValidate(NewRecipeInput, {}).catch(
      errors => errors,
    );
    throw new BadRequestException(errors);
  }

  @Query(() => Recipe)
  async error500(): Promise<Recipe> {
    throw new Error('unexpected error');
  }

  @Query(() => Recipe)
  async modernUnknown(): Promise<Recipe> {
    throw new UnknownError('unknown message', {
      props: {
        userId: 1,
      },
    });
  }

  @Subscription(() => Recipe)
  recipeAdded() {
    return this.pubSub.asyncIterator('recipeAdded');
  }

  async onModuleDestroy() {
    await this.queue.close();
  }
}
