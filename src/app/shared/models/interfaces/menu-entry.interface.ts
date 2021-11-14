import { Day } from "@models/types/day.type";
import { Orientation } from "@models/types/orientation.type";
import { IDish } from "./dish.interface";

export interface IMenuEntry {
  day: Day;
  dishes: IDish[];
  fallbackText: string;
  orientation: Orientation;
}
