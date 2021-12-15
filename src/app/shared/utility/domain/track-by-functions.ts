import { Day } from "@models/day.type";
import { DishType } from "@models/dish-type.type";
import { trackByFactory } from "../generic/track-by-factory";

export const trackBySelf = trackByFactory(item => item);
export const trackById = trackByFactory<{ id: string }, string>(item => item.id);
export const trackByDay = trackByFactory<{ day: Day }, string>(item => item.day);
export const trackByDishType = trackByFactory<{ type: DishType }, DishType>(item => item.type);
