import { Day } from "../types/day.type";
import { IMeal } from "./meal.interface";

export interface IMenuEntry {
  id: string;
  day: Day;
  meal: IMeal | undefined;
}
