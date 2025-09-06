import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { CqrxModule } from 'nestjs-cqrx';

import { AddRecipeUseCase } from './add-recipe.usecase';
import { RecipeAggregate } from './recipe.aggregate';
import * as recipeConstants from './recipe.constants';
import { RecipeFinder } from './recipe.finder';
import { RecipeProcessor } from './recipe.processor';
import { RecipeResolver } from './recipe.resolver';
import * as Modules from '../modules'; // must be imported last
import { RecipeProjection } from './recipe.projection';
import { RemoveRecipeUseCase } from './remove-recipe.usecase';

@Module({
  imports: [
    Modules.Prisma,
    CqrxModule.forFeature([RecipeAggregate]),
    BullModule.registerQueue({
      name: recipeConstants.QUEUE_NAME,
    }),
    BullBoardModule.forFeature({
      adapter: BullMQAdapter,
      name: recipeConstants.QUEUE_NAME,
    }),
  ],
  providers: [
    RecipeResolver,
    RecipeProcessor,
    PubSub,
    RecipeProjection,
    AddRecipeUseCase,
    RemoveRecipeUseCase,
    RecipeFinder,
  ],
})
export class RecipeModule {}
