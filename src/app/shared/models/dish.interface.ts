import { DishDto } from "./dtos/dish-dto.interface";
import { Tag } from "./tag.interface";

export interface Dish extends Omit<DishDto, 'tagIds'> {
  tags: Tag[];
}
