import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { concatMap, first, tap } from 'rxjs/operators';

import { User } from '@models/user.interface';
import { UserPreferences } from '@models/user-preferences.interface';
import { AuthService } from './auth.service';
import { UserDocumentService } from './user-document.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private _authService: AuthService,
    private _userDocumentService: UserDocumentService,
  ) { }

  public getUser(): Observable<User | undefined> {
    return this._authService.uid$.pipe(
      first(),
      concatMap(uid => {
        if (uid) {
          return this._userDocumentService.getUser(uid);
        }
        return of(undefined);
      }),
    );
  }

  public getPreferences(): Observable<UserPreferences | undefined> {
    return this._authService.uid$.pipe(
      first(),
      concatMap(uid => {
        if (uid) {
          return this._userDocumentService.getPreferences(uid);
        }
        return of(undefined);
      }),
    );
  }

  public updatePreferences(updates: Partial<UserPreferences>): Observable<User | undefined> {
    return this.getUser().pipe(
      first(),
      tap(async user => {
        if (!user?.uid) {
          return;
        }
        await this._userDocumentService.updatePreferences(user, updates);
      }),
    );
  }
}
