import { Injectable } from '@nestjs/common';
import { NewRecipeInput } from './dto/new-recipe.input';
import { RecipesArgs } from './dto/recipes.args';
import { Recipe } from './models/recipe.model';
import { Recipe as RecipeAggregate } from './recipe.aggregate';
import { PubSub } from 'graphql-subscriptions';
import { InjectRepository, PrismaRepository } from '@/nestjs-prisma';
import { AggregateRepository, InjectAggregateRepository } from 'nestjs-cqrx';
import { Prisma } from '@prisma/client';

@Injectable()
export class RecipeService {
  constructor(
    private readonly pubSub: PubSub,
    @InjectRepository('recipe')
    private readonly viewRepository: PrismaRepository['recipe'],
    @InjectAggregateRepository(RecipeAggregate)
    private readonly aggregateRepository: AggregateRepository<RecipeAggregate>,
  ) {}

  async addRecipe(recipeId: string, data: NewRecipeInput): Promise<void> {
    const recipe = new RecipeAggregate(recipeId);
    recipe.addRecipe(data);
    await this.aggregateRepository.save(recipe);
    const recipeAdded = await this.createProjection(recipeId);

    this.pubSub.publish('recipeAdded', { recipeAdded });
  }

  async findOneById(id: string): Promise<Recipe> {
    return {} as any;
  }

  async findAll(recipesArgs: RecipesArgs): Promise<Recipe[]> {
    return [] as Recipe[];
  }

  async remove(id: string): Promise<boolean> {
    return true;
  }

  async createProjection(recipe: RecipeAggregate);
  async createProjection(id: string);
  async createProjection(arg: string | RecipeAggregate) {
    const [id, recipe] = await this.parseStreamIdAggregate(arg);

    const data: Prisma.RecipeCreateInput = {
      title: recipe.title,
      creationDate: recipe.addedAt,
      description: recipe.description,
      // ingredients: recipe.ingredients,
      id: id,
      isAggregating: false,
    };

    return await this.viewRepository.create({ data });
  }

  private async parseStreamIdAggregate(
    arg: string | RecipeAggregate,
  ): Promise<[string, RecipeAggregate]> {
    if (typeof arg === 'string') {
      const recipe = await this.aggregateRepository.findOne(arg);
      return [arg, recipe];
    }
    return [arg.id, arg];
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
