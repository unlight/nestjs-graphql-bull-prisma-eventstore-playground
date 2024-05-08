import { BullModule } from '@nestjs/bull';
import { RecipeResolver } from './recipe.resolver';
import { RecipeService } from './recipe.service';
import { Module } from '@nestjs/common';
import { RecipeProcessor } from './recipe.processor';
import { PubSub } from 'graphql-subscriptions';
import { CqrxModule } from 'nestjs-cqrx';
import { Recipe } from './recipe.aggregate';

@Module({
  imports: [
    CqrxModule.forFeature([Recipe]),
    BullModule.registerQueue({
      name: 'recipe',
    }),
  ],
  providers: [RecipeResolver, RecipeService, RecipeProcessor, PubSub],
})
export class RecipeModule {}
