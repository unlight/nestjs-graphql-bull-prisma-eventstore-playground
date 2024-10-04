import { Injectable } from '@nestjs/common';
import { ensure } from 'errorish';
import { PubSub } from 'graphql-subscriptions';
import { fromPromise } from 'neverthrow';
import { ObjectType } from 'simplytyped';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipeProjection } from './recipe.projection';
import {
  InjectAggregateRepository,
  AggregateRepository,
} from './recipe.providers';

@Injectable()
export class AddRecipeUseCase {
  constructor(
    private readonly pubSub: PubSub,
    @InjectAggregateRepository()
    private readonly aggregateRepository: AggregateRepository,
    private readonly projection: RecipeProjection,
  ) {}

  async execute(
    recipeId: string,
    objectData: ObjectType<NewRecipeInput>,
  ): Promise<void> {
    const recipe = this.aggregateRepository.create(recipeId);
    await recipe.addRecipe({ findExisting: () => void 0, objectData });
    await recipe.commit();

    await fromPromise(
      (async () => {
        await this.projection.create(recipeId);
      })(),
      error => ensure(error),
    )
      .match(
        async recipeAdded => {
          await this.pubSub.publish('recipeAdded', { recipeAdded });
        },
        async error => {
          recipe.removeRecipe({ reason: error.message.trim() });
          await recipe.commit();
          await this.projection.update(recipe.id);
        },
      )
      .catch(cause => {
        throw new Error('Add failed', { cause });
      });
  }
}
