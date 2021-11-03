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
  private _endpoint = 'users';

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

  public getUser(): Observable<IUser | undefined> {
    return this.uid$.pipe(
      switchMap(uid => this._firestoreService.getOne<IUser>(this._endpoint, uid)),
    );
  }

  public createUser(
    { name, email }: { name: string, email: string }
  ): Observable<string | undefined> {
    return this.uid$.pipe(
      first(),
      tap(async uid => {
        if (uid) {
          await this._firestoreService.create<IUser>(
            this._endpoint,
            uid,
            {
              uid,
              name,
              email,
              preferences: {
                darkMode: false,
                dayNameDisplay: 'full',
                emptyMealText: 'undecided',
                menuStartDay: 'Monday',
              },
            }
          );
        }
      })
    );
  }

  public getPreferences(): Observable<IUserPreferences | undefined> {
    return this.getUser().pipe(
      map(user => user?.preferences),
    );
  }

  public updatePreferences(updates: Partial<IUserPreferences>): Observable<IUser | undefined> {
    return this.getUser().pipe(
      first(),
      tap(async user => {
        if (!user?.uid) {
          return;
        }
        const fallbackPreferences = user?.preferences ?? {
          darkMode: false,
          dayNameDisplay: 'full',
          emptyMealText: 'undecided',
          menuStartDay: 'Monday',
        };
        await this._firestoreService.update<IUser>(
          this._endpoint,
          user.uid,
          { preferences:
            {
              darkMode: updates?.darkMode ?? fallbackPreferences.darkMode,
              dayNameDisplay: updates?.dayNameDisplay ?? fallbackPreferences.dayNameDisplay,
              emptyMealText: updates?.emptyMealText ?? fallbackPreferences.emptyMealText,
              menuStartDay: updates?.menuStartDay ?? fallbackPreferences.menuStartDay,
            },
          }
        );
      }),
    );
  }
}
