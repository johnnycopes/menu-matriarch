import { IMenuDbo } from "@models/dbos/menu-dbo.interface";
import { Day } from "@models/types/day.type";
import { Orientation } from "@models/types/orientation.type";
import { IDish } from "./dish.interface";

export interface IMenu extends IMenuDbo {
  entries: {
    day: Day;
    dishes: IDish[];
  }[],
  entryOrientation: Orientation,
  entryFallbackText: string;
}
