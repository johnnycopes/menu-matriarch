import { Day } from "../types/day.type";
import { IMeal } from "./meal.interface";

export interface IMenuEntry {
  day: Day;
  meal: IMeal | undefined;
}
