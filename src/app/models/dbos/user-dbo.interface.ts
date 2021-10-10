import { IUserPreferences } from "../interfaces/user-preferences.interface";

export interface IUserDbo {
  id: string;
  name: string;
  email: string | undefined;
  preferences: IUserPreferences;
}
