import { MenuDbo } from "@models/dbos/menu-dbo.interface";
import { Orientation } from "@models/types/orientation.type";
import { MenuEntry } from "./menu-entry.interface";

export interface Menu extends MenuDbo {
  entries: MenuEntry[],
  orientation: Orientation,
  fallbackText: string;
}
