import { DayNameDisplay } from "@models/types/date-name-display.type";
import { Day } from "@models/types/day.type";
import { Orientation } from "@models/types/orientation.type";

export interface IUserDbo {
  uid: string;
  name: string;
  email: string | null;
  preferences: {
    darkMode: boolean;
    dayNameDisplay: DayNameDisplay;
    emptyDishText: string;
    menuOrientation: Orientation;
    menuStartDay: Day;
  };
}
