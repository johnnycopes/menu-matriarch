import { Day } from "../types/day.type";

export type Menu = {
  [day in Day]: string | undefined;
};

export interface IMenu {
  id: string;
  uid: string;
  menu: Menu;
}
