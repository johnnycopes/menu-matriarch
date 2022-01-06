import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';

import { User } from '@models/user.interface';
import { UserPreferences } from '@models/user-preferences.interface';
import { UserDocumentService } from './user-document.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private _userDocumentService: UserDocumentService) { }

  public getUser(): Observable<User | undefined> {
    return this._userDocumentService.getUser();
  }

  public getPreferences(): Observable<UserPreferences | undefined> {
    return this._userDocumentService.getPreferences();
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
