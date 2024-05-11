import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import to from 'await-to-js';
import { PubSub } from 'graphql-subscriptions';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe as RecipeObject } from './models/recipe.model';
import { Recipe as RecipeAggregate } from './recipe.aggregate';
import { Recipe } from './recipe.providers';
import { ObjectType } from 'simplytyped';
import { ensure } from 'errorish';

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
    const recipe = new RecipeAggregate(recipeId);
    await recipe.addRecipe(objectData);
    await this.aggregateRepository.save(recipe);
    let recipeAdded: Recipe.CreateResult;
    try {
      if (recipe.code) await this.validateUniqCode(recipeId, recipe.code);
      recipeAdded = await this.createProjection(recipeId);
    } catch (exception) {
      const error = ensure(exception);
      recipe.removeRecipe({ reason: error.message.trim() });
      await this.aggregateRepository.save(recipe);
      await this.createProjection(recipe);

      return;
    }

    this.pubSub.publish('recipeAdded', { recipeAdded });
  }

  createProjection(recipe: RecipeAggregate): Promise<Recipe.CreateResult>;
  createProjection(id: string): Promise<Recipe.CreateResult>;
  async createProjection(
    argument: string | RecipeAggregate,
  ): Promise<Recipe.CreateResult> {
    const [id, recipe] = await this.parseStreamIdAggregate(argument);
    const data: Prisma.RecipeCreateInput = {
      code: recipe.code,
      creationDate: recipe.addedAt,
      description: recipe.description,
      // ingredients: recipe.ingredients,
      id: id,
      isActive: recipe.isActive,
      isAggregating: false,
      title: recipe.title,
    };

    return await this.viewRepository.create({ data });
  }

  private async parseStreamIdAggregate(
    argument: string | RecipeAggregate,
  ): Promise<[string, RecipeAggregate]> {
    if (typeof argument === 'string') {
      const recipe = await this.aggregateRepository.findOne(argument);
      return [argument, recipe];
    }
    return [argument.id, argument];
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

  async validateUniqCode(exceptId: string, code: string) {
    const recipe = await this.viewRepository.findFirst({
      where: { NOT: { id: exceptId }, code },
    });
    if (recipe) {
      throw new TypeError(`Code exists in ${recipe.id}`);
    }
  }

  // handleCreateError(eventError: EventError): RemoveCountry | undefined {
  //   if (
  //     EventError.is<CountryAdded, Prisma.PrismaClientKnownRequestError>(
  //       eventError,
  //     )
  //   ) {
  //     return new RemoveCountry(
  //       eventError.event.data.id,
  //       eventError.cause?.message || 'Unknown error',
  //     );
  //   }
  // }

  // async updateProjection(id: string) {
  //   await this.viewRepository.update({
  //     data: { isAggregating: true },
  //     where: { id },
  //   });

  //   const country = await this.aggregateRepository.findOne(id);
  //   const data: Prisma.CountryUpdateInput = {
  //     code: country.code,
  //     name: country.name,
  //     addedAt: country.addedAt,
  //     isAggregating: false,
  //   };

  //   await this.viewRepository.update({ data, where: { id } });
  // }
}
