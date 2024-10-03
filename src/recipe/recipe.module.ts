import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PubSub } from 'graphql-subscriptions';
import { CqrxModule } from 'nestjs-cqrx';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { RecipeAggregate } from './recipe.aggregate';
import { RecipeResolver } from './recipe.resolver';
import { RecipeProcessor } from './recipe.processor';
import * as Modules from '../modules'; // must be imported last
import { AddRecipeUseCase } from './add-recipe.usecase';
import { RemoveRecipeUseCase } from './remove-recipe.usecase';
import { RecipeProjection } from './recipe.projection';
import { RecipeService } from './recipe.service';

@Module({
  imports: [
    Modules.Prisma,
    CqrxModule.forFeature([RecipeAggregate]),
    BullModule.registerQueue({
      name: 'recipe',
    }),
    BullBoardModule.forFeature({
      adapter: BullAdapter,
      name: 'recipe',
    }),
  ],
  providers: [
    RecipeResolver,
    RecipeProcessor,
    PubSub,
    RecipeProjection,
    AddRecipeUseCase,
    RemoveRecipeUseCase,
    RecipeService,
  ],
})
export class RecipeModule {}
