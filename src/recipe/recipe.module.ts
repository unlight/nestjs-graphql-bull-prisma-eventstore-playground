import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PubSub } from 'graphql-subscriptions';
import { CqrxModule } from 'nestjs-cqrx';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { RecipeAggregate } from './recipe.aggregate';
import { RecipeResolver } from './recipe.resolver';
import { RecipeProcessor } from './recipe.processor';
import * as Modules from '../modules'; // must be imported last
import { AddRecipeUseCase } from './add-recipe.usecase';
import { RemoveRecipeUseCase } from './remove-recipe.usecase';
import { RecipeProjection } from './recipe.projection';
import { RecipeFinder } from './recipe.finder';
import * as recipeConstants from './recipe.constants';

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
