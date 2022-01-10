import { DishDto } from "./dtos/dish-dto.interface";
import { Ingredient } from "./ingredient.interface";
import { Tag } from "./tag.interface";

export interface Dish extends Omit<DishDto, 'ingredients' | 'tags'> {
  ingredients: Ingredient[];
  tags: Tag[];
}
