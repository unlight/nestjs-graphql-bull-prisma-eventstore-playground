import { BullModule } from '@nestjs/bull';
import { RecipeResolver } from './recipe.resolver';
import { RecipeService } from './recipe.service';
import { Module } from '@nestjs/common';
import { RecipeProcessor } from './recipe.processor';
import { PubSub } from 'graphql-subscriptions';
import { CqrxModule } from 'nestjs-cqrx';
import { RecipeAggregate } from './recipe.aggregate';
import * as Modules from '../modules';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullBoardModule } from '@bull-board/nestjs';

@Module({
  imports: [
    Modules.Prisma,
    CqrxModule.forFeature([RecipeAggregate]),
    BullModule.registerQueue({
      name: 'recipe',
      settings: {
        drainDelay: 0,
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
