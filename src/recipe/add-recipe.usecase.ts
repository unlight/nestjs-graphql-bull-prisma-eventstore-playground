import { Injectable } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { fromPromise } from 'neverthrow';
import { ObjectType } from 'simplytyped';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipeProjection } from './recipe.projection';
import {
  InjectAggregateRepository,
  AggregateRepository,
} from './recipe.providers';
import { BaseError } from '@/errors';

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
    debugger;
    const recipe = this.aggregateRepository.create(recipeId);
    await recipe.addRecipe({ findExisting: () => void 0, objectData });
    await recipe.commit();

    const RecipeError = BaseError.subclass('RecipeError', {
      props: { code: '', recipeId },
    });

    await fromPromise(
      (async () => {
        await this.projection.create(recipeId);
      })(),
      error => RecipeError.normalize(error),
    )
      .match(
        async recipeAdded => {
          await this.pubSub.publish('recipeAdded', { recipeAdded });
        },
        async error => {
          // if (error.code === 'P2002'/* Unique constraint failed */)
          recipe.removeRecipe({ reason: error.message.trim() });
          await recipe.commit();
          await this.projection.update(recipe.id);
        },
      )
      .catch(cause => {
        throw new RecipeError('Add failed:', { cause });
      });
  }
}
