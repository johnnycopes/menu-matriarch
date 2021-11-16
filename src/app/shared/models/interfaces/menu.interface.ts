import { IMenuDbo } from "@models/dbos/menu-dbo.interface";
import { Orientation } from "@models/types/orientation.type";
import { IMenuEntry } from "./menu-entry.interface";

export interface IMenu extends IMenuDbo {
  entries: IMenuEntry[],
  entryOrientation: Orientation,
  entryFallbackText: string;
}
