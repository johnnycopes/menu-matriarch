import { IUserPreferences } from "./user-preferences.interface";

export interface IUser {
  name: string;
  email: string | undefined;
  preferences: IUserPreferences;
}

export interface IUserDbo extends IUser { }
