import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { Endpoint } from '@models/enums/endpoint.enum';
import { UserDbo } from '@models/dbos/user-dbo.interface';
import { User } from '@models/interfaces/user.interface';
import { UserPreferences } from '@models/interfaces/user-preferences.interface';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _endpoint = Endpoint.users;

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

  public getUser(): Observable<User | undefined> {
    return this.uid$.pipe(
      switchMap(uid => this._firestoreService.getOne<UserDbo>(this._endpoint, uid)),
    );
  }

  public createUser(
    { name, email }: { name: string, email: string }
  ): Observable<string | undefined> {
    return this.uid$.pipe(
      first(),
      tap(async uid => {
        if (uid) {
          await this._firestoreService.create<UserDbo>(
            this._endpoint,
            uid,
            {
              uid,
              name,
              email,
              preferences: {
                darkMode: false,
                dayNameDisplay: 'full',
                emptyDishText: 'undecided',
                menuOrientation: 'horizontal',
                menuStartDay: 'Monday',
              },
            }
          );
        }
      })
    );
  }

  public getPreferences(): Observable<UserPreferences | undefined> {
    return this.getUser().pipe(
      map(user => user?.preferences),
    );
  }

  public updatePreferences(updates: Partial<UserPreferences>): Observable<User | undefined> {
    return this.getUser().pipe(
      first(),
      tap(async user => {
        if (!user?.uid) {
          return;
        }
        const fallbackPreferences = user?.preferences ?? {
          darkMode: false,
          dayNameDisplay: 'full',
          emptyDishText: 'undecided',
          menuOrientation: 'horizontal',
          menuStartDay: 'Monday',
        };
        await this._firestoreService.update<UserDbo>(
          this._endpoint,
          user.uid,
          { preferences:
            {
              darkMode: updates?.darkMode ?? fallbackPreferences.darkMode,
              dayNameDisplay: updates?.dayNameDisplay ?? fallbackPreferences.dayNameDisplay,
              emptyDishText: updates?.emptyDishText ?? fallbackPreferences.emptyDishText,
              menuOrientation: updates?.menuOrientation ?? fallbackPreferences.menuOrientation,
              menuStartDay: updates?.menuStartDay ?? fallbackPreferences.menuStartDay,
            },
          }
        );
      }),
    );
  }
}
