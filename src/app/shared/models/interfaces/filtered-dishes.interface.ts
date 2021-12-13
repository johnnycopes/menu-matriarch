import { DishType } from "@models/types/dish-type.type";
import { Dish } from "./dish.interface";

export interface FilteredDishesGroup {
  type: DishType;
  dishes: Dish[];
  placeholderText?: string;
}
