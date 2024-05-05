import { RecipesResolver } from './recipes.resolver';
import { RecipesService } from './recipes.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [RecipesResolver, RecipesService],
})
export class RecipesModule {}
