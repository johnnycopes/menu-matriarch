import { IUserPreferences } from "../interfaces/user-preferences.interface";

export interface IUserDbo {
  name: string;
  email: string | undefined;
  preferences: IUserPreferences;
}
