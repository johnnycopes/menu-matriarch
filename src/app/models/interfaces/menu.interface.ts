import { Day } from "../types/day.type";

export interface IMenuEntry {
  day: Day;
  meal: string | undefined;
}

export type IMenu = {
  [day in Day]: string | undefined;
};
export interface IMenuDbo {
  uid: string;
  menu: IMenu;
}
