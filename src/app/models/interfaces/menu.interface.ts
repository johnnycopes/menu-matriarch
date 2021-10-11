import { Day } from "../types/day.type";

export type Menu = {
  [day in Day]: string | undefined;
};

export interface IMenu {
  uid: string;
  menu: Menu;
}
