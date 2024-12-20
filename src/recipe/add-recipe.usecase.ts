import { BaseError } from '@/errors';
import { Injectable, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { ResultAsync } from 'neverthrow';
import { ObjectType } from 'simplytyped';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipeProjection } from './recipe.projection';
import * as Recipe from './recipe.providers';

@Injectable()
export class AddRecipeUseCase {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly pubSub: PubSub,
    @Recipe.InjectAggregateRepository()
    private readonly store: Recipe.AggregateRepository,
    private readonly projection: RecipeProjection,
  ) {}

  async execute(
    recipeId: string,
    objectData: ObjectType<NewRecipeInput>,
  ): Promise<void> {
    const recipe = this.store.create(recipeId);
    await recipe.addRecipe({ findExisting: () => void 0, objectData });
    await recipe.commit();

    const RecipeError = BaseError.subclass('RecipeError', {
      props: { code: '', recipeId },
    });

    await ResultAsync.fromPromise(this.projection.create(recipeId), error =>
      RecipeError.normalize(error),
    )
      .match(
        async recipeAdded => {
          await this.pubSub.publish('recipeAdded', { recipeAdded });
        },
        async error => {
          this.logger.warn(`Failed create projection: ${error.message}`);
          // if (error.code === 'P2002'/* Unique constraint failed */)
          recipe.removeRecipe({ reason: error.message.trim() });
          await recipe.commit();
          await this.projection.update(recipe.id);
        },
      )
      .catch(cause => {
        throw new RecipeError('Add recipe error:', { cause });
      });
  }
}
