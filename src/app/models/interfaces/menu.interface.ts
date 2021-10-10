import { Day } from "../types/day.type";

export type IMenu = {
  [day in Day]: string | undefined;
};
