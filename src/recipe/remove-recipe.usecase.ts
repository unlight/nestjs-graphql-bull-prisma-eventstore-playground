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
    private readonly aggregateRepository: AggregateRepository,
    private readonly projection: RecipeProjection,
  ) {}

  async execute(data: ObjectType<RemoveRecipeInput>): Promise<void> {
    const recipe = await this.aggregateRepository.load(data.id);
    recipe.removeRecipe({ reason: data.removeReason });
    await this.aggregateRepository.save(recipe);
    await this.projection.update(data.id);
  }
}
