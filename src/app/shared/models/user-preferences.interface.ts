import { DayNameDisplay } from "./date-name-display.type";
import { Day } from "./day.type";
import { Orientation } from "./orientation.type";

export interface UserPreferences {
  darkMode: boolean;
  dayNameDisplay: DayNameDisplay;
  emptyMealText: string;
  menuOrientation: Orientation;
  menuStartDay: Day;
}
