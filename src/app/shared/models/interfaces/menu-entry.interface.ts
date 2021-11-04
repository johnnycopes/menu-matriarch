import { Day } from "../types/day.type";
import { IDish } from "./dish.interface";

export interface IMenuEntry {
  day: Day;
  main: IDish | undefined;
  sides: IDish[];
}
