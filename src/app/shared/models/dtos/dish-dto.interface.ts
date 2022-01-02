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
  menus: string[];
  meals: string[];
  tags: string[];
  notes: string;
  usages: number;
}
