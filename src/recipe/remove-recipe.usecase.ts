import { Injectable } from '@nestjs/common';
import { ObjectType } from 'simplytyped';

import { RemoveRecipeInput } from './dto/remove-recipe.input';
import { RecipeProjection } from './recipe.projection';
import {
  AggregateRepository,
  InjectAggregateRepository,
} from './recipe.providers';

@Injectable()
export class RemoveRecipeUseCase {
  constructor(
    @InjectAggregateRepository()
    private readonly store: AggregateRepository,
    private readonly projection: RecipeProjection,
  ) {}

  async execute(data: ObjectType<RemoveRecipeInput>): Promise<void> {
    const recipe = await this.store.load(data.id);
    recipe.removeRecipe({ reason: data.removeReason });
    await this.store.save(recipe);
    await this.projection.update(data.id);
  }
}
