import { Orientation } from "@models/types/orientation.type";
import { IMenuEntry } from "./menu-entry.interface";

export interface IMenuDisplay {
  id: string;
  name: string;
  entries: IMenuEntry[];
  entryFallbackText: string;
  entryOrientation: Orientation;
}
