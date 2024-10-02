import { Injectable } from '@nestjs/common';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe as RecipeObject } from './models/recipe.model';
import * as Recipe from './recipe.providers';

@Injectable()
export class RecipeService {
  constructor(private readonly viewRepository: Recipe.ViewRepository) {}

  async findOneById(id: string): Promise<RecipeObject | null> {
    return this.viewRepository.findFirst({ where: { id } });
  }

  async findAll(recipesArgs: RecipesArgs): Promise<RecipeObject[]> {
    return [] as RecipeObject[];
  }

  async markAsError(id: string, error: string) {
    await this.viewRepository.update({ data: { title: '' }, where: { id } });
  }
}
