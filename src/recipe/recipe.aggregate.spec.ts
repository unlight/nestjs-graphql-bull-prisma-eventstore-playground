import { beforeEach, expect, it } from 'vitest';

import { RecipeAggregate } from './recipe.aggregate';

let recipeAggregate: RecipeAggregate;

beforeEach(() => {
  recipeAggregate = new RecipeAggregate('1');
});

it('smoke', () => {
  expect(recipeAggregate).toBeTruthy();
  expect(recipeAggregate.id).toBe('1');
});

// describe('addRecipe', () => {
//   it('should add a recipe successfully', async () => {
//     const objectData = {
//       code: 'REC123',
//       title: 'Test Recipe',
//       ingredients: ['Ingredient1', 'Ingredient2'],
//     };

//     mockFindExisting.mockResolvedValueOnce(undefined); // No existing recipe

//     await recipeAggregate.addRecipe({
//       objectData,
//       findExisting: mockFindExisting,
//     });

//     expect(recipeAggregate.title).toBe('Test Recipe');
//     expect(recipeAggregate.code).toBe('REC123');
//     expect(recipeAggregate.isActive).toBe(true);
//     expect(recipeAggregate.addedAt).toBeInstanceOf(Date);
//     expect(mockFindExisting).toHaveBeenCalledWith('1', 'REC123');
//   });

//   it('should throw an error if the recipe code already exists', async () => {
//     const objectData = {
//       code: 'REC123',
//       title: 'Test Recipe',
//       ingredients: ['Ingredient1', 'Ingredient2'],
//     };

//     mockFindExisting.mockResolvedValueOnce('2'); // Existing recipe found

//     await expect(
//       recipeAggregate.addRecipe({
//         objectData,
//         findExisting: mockFindExisting,
//       }),
//     ).rejects.toThrow('Code exists in 2');
//   });
// });

// describe('removeRecipe', () => {
//   it('should remove a recipe successfully', () => {
//     const reason = 'Not needed anymore';

//     recipeAggregate.removeRecipe({ reason });

//     expect(recipeAggregate.isActive).toBe(false);
//     expect(recipeAggregate.removedAt).toBeInstanceOf(Date);
//     expect(recipeAggregate.removeReason).toBe(reason);
//   });
// });
