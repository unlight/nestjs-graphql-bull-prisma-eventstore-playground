import { AggregateRoot, EventHandler } from 'nestjs-cqrx';
import { RecipeRemoved, RecipeAdded } from './recipe.events';
import { NewRecipeInput } from './dto/new-recipe.input';

export class Recipe extends AggregateRoot {
  title: string = '';
  addedAt: Date = new Date('');
  description: string = '';
  isActive: boolean = false;
  removedAt?: Date;
  removeReason?: string;

  @EventHandler(RecipeAdded)
  RecipeAdded(event: RecipeAdded) {
    const { addedAt, title } = event.data;
    this.addedAt = addedAt;
    this.isActive = true;
    this.title = title;
  }

  addRecipe(data: NewRecipeInput) {
    this.apply(
      new RecipeAdded({
        ...data,
        id: this.id,
        addedAt: new Date(),
      }),
    );
  }

  removeRecipe(args: { reason: string }) {
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
  RecipeRemoved(event: RecipeRemoved) {
    const { reason, removedAt } = event.data;

    this.isActive = false;
    this.removedAt = removedAt;
    this.removeReason = reason;
  }
}
