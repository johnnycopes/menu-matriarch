import { DishType } from "../types/dish-type.type";

export interface IDish {
  id: string;
  uid: string;
  type: DishType;
  name: string;
  favorited: boolean;
  description: string;
  ingredients: string[];
  tags: string[];
  menus: string[];
  usages: number;
}
