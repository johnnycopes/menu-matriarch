import { IngredientType } from "@models/ingredient-type.type";

export interface IngredientDto {
  id: string;
  uid: string;
  name: string;
  type: IngredientType;
  dishes: string[];
}
