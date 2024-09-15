import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ensure } from 'errorish';
import { PubSub } from 'graphql-subscriptions';
import { fromPromise, fromAsyncThrowable } from 'neverthrow';
import { ObjectType } from 'simplytyped';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { RemoveRecipeInput } from './dto/remove-recipe.input';
import { Recipe as RecipeObject } from './models/recipe.model';
import { RecipeAggregate } from './recipe.aggregate';
import * as Recipe from './recipe.providers';

@Injectable()
export class RecipeService {
  constructor(
    private readonly pubSub: PubSub,
    @Recipe.InjectViewRepository()
    private readonly viewRepository: Recipe.ViewRepository,
    @Recipe.InjectAggregateRepository()
    private readonly aggregateRepository: Recipe.AggregateRepository,
  ) {}

  async addRecipe(
    recipeId: string,
    objectData: ObjectType<NewRecipeInput>,
  ): Promise<void> {
    const recipe = this.aggregateRepository.create(recipeId);
    await recipe.addRecipe({ findExisting: () => void 0, objectData });
    await recipe.commit();

    await fromPromise(
      (async () => {
        await this.createProjection(recipeId);
      })(),
      error => ensure(error),
    ).match(
      async recipeAdded => {
        await this.pubSub.publish('recipeAdded', { recipeAdded });
      },
      async error => {
        recipe.removeRecipe({ reason: error.message.trim() });
        await recipe.commit();
        await this.updateProjection(recipe.id);
      },
    );
  }

  async removeRecipe(data: ObjectType<RemoveRecipeInput>) {
    const recipe = await this.aggregateRepository.load(data.id);
    recipe.removeRecipe({ reason: data.removeReason });
    await this.aggregateRepository.save(recipe);
    await this.updateProjection(data.id);
  }

  private createProjection(
    recipe: RecipeAggregate,
  ): Promise<Recipe.CreateResult>;
  private createProjection(id: string): Promise<Recipe.CreateResult>;
  private async createProjection(
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

  async findOneById(id: string): Promise<RecipeObject | null> {
    return this.viewRepository.findFirst({ where: { id } });
  }

  async findAll(recipesArgs: RecipesArgs): Promise<RecipeObject[]> {
    return [] as RecipeObject[];
  }

  async markAsError(id: string, error: string) {
    await this.viewRepository.update({ data: { title: '' }, where: { id } });
  }

  private async findExisting(
    exceptId: string,
    code?: string,
  ): Promise<string | undefined> {
    if (code == null) return;
    const recipe = await this.viewRepository.findFirst({
      select: { id: true },
      where: { NOT: { id: exceptId }, code, isActive: true },
    });

    return recipe?.id;
  }

  private async updateProjection(id: string) {
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
