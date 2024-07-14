import { transformAndValidate } from 'class-transformer-validator';
import { AggregateRoot, EventHandler } from 'nestjs-cqrx';
import { ObjectType } from 'simplytyped';
import { NewRecipeInput } from './dto/new-recipe.input';
import {
  HandleRecipeEvents,
  RecipeAdded,
  RecipeRemoved,
} from './recipe.events';

type AddRecipeArgs = {
  objectData: ObjectType<NewRecipeInput>;
  findExisting: (
    exceptId: string,
    code?: string,
  ) => Promise<string | undefined> | undefined;
};

export class RecipeAggregate
  extends AggregateRoot
  implements HandleRecipeEvents
{
  protected static readonly streamName = 'Recipe';
  title: string = '';
  addedAt: Date = new Date('');
  description: string = '';
  isActive: boolean = false;
  removedAt?: Date;
  removeReason?: string;
  code?: string;
  ingredients?: string[];

  @EventHandler(RecipeAdded)
  applyRecipeAdded(event: RecipeAdded) {
    const { addedAt, code, title } = event.data;
    this.addedAt = addedAt;
    this.isActive = true;
    this.title = title;
    this.code = code;
  }

  async addRecipe(args: AddRecipeArgs) {
    const { findExisting, objectData } = args;
    const data = await transformAndValidate(NewRecipeInput, objectData);
    const existsId = await findExisting(this.id, data.code);
    if (existsId) {
      throw new Error(`Code exists in ${existsId}`);
    }

    this.apply(
      new RecipeAdded({
        addedAt: new Date(),
        code: data.code,
        id: this.id,
        ingredients: data.ingredients,
        title: data.title,
      }),
    );
  }

  removeRecipe(args: { reason?: string }) {
    const { reason } = args;

    this.apply(
      new RecipeRemoved({
        id: this.id,
        reason,
        removedAt: new Date(),
      }),
    );
  }

  @EventHandler(RecipeRemoved)
  applyRecipeRemoved(event: RecipeRemoved) {
    const { reason, removedAt } = event.data;

    this.isActive = false;
    this.removedAt = removedAt;
    this.removeReason = reason;
  }
}
