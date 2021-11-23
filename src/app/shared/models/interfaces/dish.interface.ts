import { DishDto } from "@models/dtos/dish-dto.interface";
import { Tag } from "./tag.interface";

export interface Dish extends Omit<DishDto, 'tags'> {
  tags: Tag[];
}
