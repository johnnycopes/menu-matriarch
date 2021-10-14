import { Day } from "../types/day.type";

export interface IMenu {
  id: string;
  uid: string;
  menu: {
    [day in Day]: string | undefined;
  }
}
