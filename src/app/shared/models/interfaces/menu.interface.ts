import { Day } from "../types/day.type";

export interface IMenu {
  id: string;
  uid: string;
  selected: boolean;
  contents: {
    [day in Day]: string | undefined;
  };
}
