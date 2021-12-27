import { MealDto } from "./dtos/meal-dto.interface";
import { Dish } from "./dish.interface";
import { Tag } from "./tag.interface";

export interface Meal extends Omit<MealDto, 'dishes' | 'tags'> {
  dishes: Dish[];
  tags: Tag[];
}
