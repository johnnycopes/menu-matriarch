import { DayNameDisplay } from "@models/types/date-name-display.type";
import { Day } from "@models/types/day.type";

export interface IUser {
  uid: string;
  name: string;
  email: string | undefined;
  preferences: IUserPreferences;
}

export interface IUserPreferences {
  darkMode: boolean;
  dayNameDisplay: DayNameDisplay;
  menuStartDay: Day;
}
