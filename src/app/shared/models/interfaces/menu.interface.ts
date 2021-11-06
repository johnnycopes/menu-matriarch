import { Day } from "../types/day.type";

export interface IMenu {
  id: string;
  uid: string;
  name: string;
  favorited: boolean;
  contents: {
    [day in Day]: string[];
  };
};
