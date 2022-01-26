import { DishType } from "../dish-type.type";

export interface DishDto {
  id: string;
  uid: string;
  type: DishType;
  name: string;
  favorited: boolean;
  description: string;
  link: string;
  ingredients: string[];
  menuIds: string[];
  mealIds: string[];
  tagIds: string[];
  notes: string;
  usages: number;
}
