import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PubSub } from 'graphql-subscriptions';
import { CqrxModule } from 'nestjs-cqrx';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { RecipeAggregate } from './recipe.aggregate';
import { RecipeResolver } from './recipe.resolver';
import { RecipeService } from './recipe.service';
import { RecipeProcessor } from './recipe.processor';
import * as Modules from '../modules'; // must be imported last

@Module({
  imports: [
    Modules.Prisma,
    CqrxModule.forFeature([RecipeAggregate]),
    BullModule.registerQueue({
      name: 'recipe',
      settings: {
        retryProcessDelay: 1000, // Resolve  [Error] Connection is closed in e2e
      },
    }),
    BullBoardModule.forFeature({
      adapter: BullAdapter,
      name: 'recipe',
    }),
  ],
  providers: [RecipeResolver, RecipeService, RecipeProcessor, PubSub],
})
export class RecipeModule {}
