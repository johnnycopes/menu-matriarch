import { MenuDto } from "@models/dtos/menu-dto.interface";
import { Orientation } from "@models/types/orientation.type";
import { MenuEntry } from "./menu-entry.interface";

export interface Menu extends MenuDto {
  entries: MenuEntry[],
  orientation: Orientation,
  fallbackText: string;
}
