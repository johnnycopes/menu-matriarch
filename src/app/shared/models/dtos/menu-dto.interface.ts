import { Day } from "../day.type";

export interface MenuDto {
  id: string;
  uid: string;
  name: string;
  favorited: boolean;
  contents: {
    [day in Day]: string[];
  };
};
