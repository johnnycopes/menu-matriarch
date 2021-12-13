import { DishType } from "./dish-type.type";

export function getDishTypes(): readonly DishType[] {
  return ['main', 'side', 'dessert'];
}
