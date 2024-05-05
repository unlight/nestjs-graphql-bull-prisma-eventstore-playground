import { RecipeResolver } from './recipe.resolver';
import { RecipeService } from './recipe.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [RecipeResolver, RecipeService],
})
export class RecipeModule {}
