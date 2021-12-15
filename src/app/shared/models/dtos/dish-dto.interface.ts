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
  tags: string[];
  notes: string;
  menus: string[];
  usages: number;
}
