import { Day } from "../types/day.type";
import { DayNameDisplay } from "../types/date-name-display.type";

export interface IUserPreferences {
  darkMode: boolean;
  dayNameDisplay: DayNameDisplay;
  menuStartDay: Day;
};
