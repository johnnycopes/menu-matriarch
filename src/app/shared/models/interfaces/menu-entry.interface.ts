import { Day } from "@models/types/day.type";
import { IDish } from "./dish.interface";

export interface IMenuEntry {
  day: Day;
  dishes: IDish[];
}
