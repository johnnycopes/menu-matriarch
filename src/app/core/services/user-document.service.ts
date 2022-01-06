import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { UserDto } from '@models/dtos/user-dto.interface';
import { Endpoint } from '@models/endpoint.enum';
import { User } from '@models/user.interface';
import { UserPreferences } from '@models/user-preferences.interface';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserDocumentService {
  private _endpoint = Endpoint.users;

  constructor(
    private _apiService: ApiService,
    private _authService: AuthService,
  ) { }

  public getUser(): Observable<User | undefined> {
    return this._authService.uid$.pipe(
      switchMap(uid => this._apiService.getOne<UserDto>(this._endpoint, uid)),
    );
  }

  public getPreferences(): Observable<UserPreferences | undefined> {
    return this.getUser().pipe(
      map(user => user?.preferences),
    );
  }

  public updatePreferences(user: User, updates: Partial<UserPreferences>): Promise<void> {
    const { uid, preferences } = user;
    return this._apiService.update<UserDto>(
      this._endpoint,
      uid,
      { preferences: {
        ...preferences,
        ...updates,
      }}
    );
  }
}
