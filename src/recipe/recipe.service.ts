import { Injectable } from '@nestjs/common';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe as RecipeObject } from './recipe.model';
import * as Recipe from './recipe.providers';

/**
 * Query (read only) recipe from projection repository.
 */
@Injectable()
export class RecipeService {
  constructor(
    @Recipe.InjectProjectionRepository()
    private readonly repository: Recipe.ProjectionRepository,
  ) {}

  async findOneById(id: string): Promise<RecipeObject | null> {
    return this.repository.findFirst({ where: { id } });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findAll(recipesArgs: RecipesArgs): Promise<RecipeObject[]> {
    return Promise.resolve([] as RecipeObject[]);
  }

  async exists(id: string) {
    const row = await this.repository.findUnique({
      select: { id: true },
      where: { id },
    });

    return Boolean(row);
  }
}
