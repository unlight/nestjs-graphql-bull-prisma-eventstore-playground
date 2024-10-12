import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RecipeAggregate } from './recipe.aggregate';
import * as Recipe from './recipe.providers';
import { RecipeFinder } from './recipe.finder';

/**
 * Mutate (write only) recipes to repository.
 */
@Injectable()
export class RecipeProjection {
  constructor(
    private readonly finder: RecipeFinder,
    @Recipe.InjectProjectionRepository()
    private readonly repository: Recipe.ProjectionRepository,
    @Recipe.InjectAggregateRepository()
    private readonly store: Recipe.AggregateRepository,
  ) {}

  create(recipe: RecipeAggregate): Promise<Recipe.CreateResult>;
  create(id: string): Promise<Recipe.CreateResult>;
  async create(
    argument: string | RecipeAggregate,
  ): Promise<Recipe.CreateResult> {
    const [id, recipe] = await this.store.streamIdAndAggregate(argument);
    const data = {
      ...this.getUpdateData(recipe),
      id,
    };

    return await this.repository.create({ data });
  }

  async update(id: string) {
    if (!(await this.finder.exists(id))) {
      return;
    }

    await this.repository.update({
      data: { isAggregating: true },
      where: { id },
    });

    const recipe = await this.store.load(id);

    const data: Prisma.RecipeUpdateInput = this.getUpdateData(recipe);

    await this.repository.update({ data, where: { id } });
  }

  private getUpdateData(recipe: RecipeAggregate) {
    return {
      code: recipe.code,
      creationDate: recipe.addedAt,
      description: recipe.description,
      ingredients: recipe.ingredients,
      isActive: recipe.isActive,
      isAggregating: false,
      title: recipe.title,
    } satisfies Prisma.RecipeUpdateInput;
  }
}
