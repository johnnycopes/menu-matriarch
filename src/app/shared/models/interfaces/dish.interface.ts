import { DishDbo } from "@models/dbos/dish-dbo.interface";
import { Tag } from "./tag.interface";

export interface Dish extends Omit<DishDbo, 'tags'> {
  tags: Tag[];
}
