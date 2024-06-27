import { BullModule } from '@nestjs/bull';
import { RecipeResolver } from './recipe.resolver';
import { RecipeService } from './recipe.service';
import { Module } from '@nestjs/common';
import { RecipeProcessor } from './recipe.processor';
import { PubSub } from 'graphql-subscriptions';
import { CqrxModule } from 'nestjs-cqrx';
import { RecipeAggregate } from './recipe.aggregate';
import * as Modules from '../modules';

@Module({
  imports: [
    Modules.Prisma,
    CqrxModule.forFeature([RecipeAggregate]),
    BullModule.registerQueue({
      name: 'recipe',
    }),
  ],
  providers: [RecipeResolver, RecipeService, RecipeProcessor, PubSub],
})
export class RecipeModule {}
