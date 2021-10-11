import { Day } from "../types/day.type";

export type Menu = {
  [day in Day]: string | undefined;
};

export interface IMenu {
  uid: string;
  menu: Menu;
}

export interface IMenuEntry {
  day: Day;
  meal: string | undefined;
}
