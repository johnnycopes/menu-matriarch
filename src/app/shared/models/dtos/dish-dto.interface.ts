import { DishType } from "../types/dish-type.type";

export interface DishDto {
  id: string;
  uid: string;
  type: DishType;
  name: string;
  favorited: boolean;
  description: string;
  link: string;
  ingredients: string[];
  tags: string[];
  menus: string[];
  usages: number;
}
