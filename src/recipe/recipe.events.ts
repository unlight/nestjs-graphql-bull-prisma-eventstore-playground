import { Event } from 'nestjs-cqrx';

type RecipeAddedData = {
  title: string;
  id: string;
  addedAt: Date;
  code?: string;
  ingredients?: string[];
};

export class RecipeAdded extends Event<RecipeAddedData> {}

type RecipeRemovedData = {
  id: string;
  reason: string;
  removedAt: Date;
};

export class RecipeRemoved extends Event<RecipeRemovedData> {}

export type RecipeEvent = RecipeRemoved | RecipeAdded;

export interface HandleRecipeEvents {
  applyRecipeAdded: (event: RecipeAdded) => void;
  applyRecipeRemoved: (event: RecipeRemoved) => void;
}
