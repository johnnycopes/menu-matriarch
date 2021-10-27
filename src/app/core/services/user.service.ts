import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { IUser, IUserPreferences } from '@models/interfaces/user.interface';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private _auth: AngularFireAuth,
    private _firestoreService: FirestoreService,
  ) { }

  public get uid$() {
    return this._auth.user.pipe(
      map(user => user?.uid),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  public getData<T>(dataFn: (uid: string | undefined) => Observable<T>): Observable<T> {
    return this._auth.user.pipe(
      map(user => user?.uid),
      switchMap(dataFn)
    );
  }

  public getUser(): Observable<IUser | undefined> {
    return this.getData(this._firestoreService.getUser);
  }

  public updatePreferences(updates: Partial<IUserPreferences>) {
    return this.getData(this._firestoreService.getUser).pipe(
      first(),
      tap(async user => {
        const fallbackPreferences = user?.preferences ?? {
          darkMode: false,
          dayNameDisplay: 'full',
          menuStartDay: 'Monday',
        };
        await this._firestoreService.updateUser(
          user?.uid,
          { preferences: {
            menuStartDay: updates?.menuStartDay ?? fallbackPreferences.menuStartDay,
            darkMode: updates?.darkMode ?? fallbackPreferences.darkMode,
            dayNameDisplay: updates?.dayNameDisplay ?? fallbackPreferences.dayNameDisplay,
          },
        });
      }),
    );
  }
}
