import { IUserPreferences } from "./user-preferences.interface";

export interface IUser {
  uid: string;
  name: string;
  email: string | undefined;
  preferences: IUserPreferences;
}
