import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RecipeAggregate } from './recipe.aggregate';
import * as Recipe from './recipe.providers';

@Injectable()
export class RecipeProjection {
  constructor(
    private readonly viewRepository: Recipe.ViewRepository,
    @Recipe.InjectAggregateRepository()
    private readonly aggregateRepository: Recipe.AggregateRepository,
  ) {}

  create(recipe: RecipeAggregate): Promise<Recipe.CreateResult>;
  create(id: string): Promise<Recipe.CreateResult>;
  async create(
    argument: string | RecipeAggregate,
  ): Promise<Recipe.CreateResult> {
    const [id, recipe] =
      await this.aggregateRepository.streamIdAndAggregate(argument);
    const data: Prisma.RecipeCreateInput = {
      code: recipe.code,
      creationDate: recipe.addedAt,
      description: recipe.description,
      id: id,
      ingredients: recipe.ingredients,
      isActive: recipe.isActive,
      isAggregating: false,
      title: recipe.title,
    };

    return await this.viewRepository.create({ data });
  }

  async update(id: string) {
    const projection = await this.viewRepository.findUnique({
      select: { id: true },
      where: { id },
    });

    if (!projection) {
      return;
    }

    await this.viewRepository.update({
      data: { isAggregating: true },
      where: { id },
    });

    const recipe = await this.aggregateRepository.load(id);

    const data: Prisma.RecipeUpdateInput = {
      code: recipe.code,
      creationDate: recipe.addedAt,
      description: recipe.description,
      ingredients: recipe.ingredients,
      isActive: recipe.isActive,
      isAggregating: false,
      title: recipe.title,
    };

    await this.viewRepository.update({ data, where: { id } });
  }
}
