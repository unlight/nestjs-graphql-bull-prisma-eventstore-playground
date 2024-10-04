import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { Recipe } from '../recipe/recipe.model';
import { NewRecipeInput } from '../recipe/dto/new-recipe.input';
import { transformAndValidate } from 'class-transformer-validator';
import { UnknownError } from '@/error-utils';

@Resolver(() => Recipe)
export class ValidationResolver {
  @Query(() => Recipe)
  error404(): Promise<Recipe> {
    throw new NotFoundException('dummy');
  }

  @Query(() => Recipe)
  async error400(): Promise<Recipe> {
    const errors = await transformAndValidate(NewRecipeInput, {}).catch(
      errors => errors,
    );
    throw new BadRequestException(errors);
  }

  @Query(() => Recipe)
  async error500(): Promise<Recipe> {
    throw new Error('unexpected error');
  }

  @Query(() => Recipe)
  async modernUnknown(): Promise<Recipe> {
    throw new UnknownError('unknown message', {
      props: {
        userId: 1,
      },
    });
  }
}
