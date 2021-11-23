import { UserPreferences } from "@models/interfaces/user-preferences.interface";

export interface UserDto {
  uid: string;
  name: string;
  email: string | null;
  preferences: UserPreferences;
}
