import { Day } from "@models/types/day.type";
import { Dish } from "./dish.interface";

export interface MenuEntry {
  day: Day;
  dishes: Dish[];
}
