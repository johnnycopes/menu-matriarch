import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { Endpoint } from '@models/endpoint.enum';
import { createUserDto } from '@shared/utility/domain/create-dtos';
import { UserDto } from '@models/dtos/user-dto.interface';
import { User } from '@models/user.interface';
import { UserPreferences } from '@models/user-preferences.interface';
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
      switchMap(uid => this._firestoreService.getOne<UserDto>(this._endpoint, uid)),
    );
  }

  public createUser(
    user: Partial<Omit<UserDto, 'uid'>>
  ): Observable<string | undefined> {
    return this.uid$.pipe(
      first(),
      tap(async uid => {
        if (uid) {
          await this._firestoreService.create<UserDto>(
            this._endpoint,
            uid,
            createUserDto({ uid, ...user }),
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
          defaultMenuStartDay: 'Monday',
          emptyMealText: 'undecided',
          mealOrientation: 'horizontal',
        };
        await this._firestoreService.update<UserDto>(
          this._endpoint,
          user.uid,
          { preferences:
            {
              darkMode: updates?.darkMode ?? fallbackPreferences.darkMode,
              dayNameDisplay: updates?.dayNameDisplay ?? fallbackPreferences.dayNameDisplay,
              defaultMenuStartDay: updates?.defaultMenuStartDay ?? fallbackPreferences.defaultMenuStartDay,
              emptyMealText: updates?.emptyMealText ?? fallbackPreferences.emptyMealText,
              mealOrientation: updates?.mealOrientation ?? fallbackPreferences.mealOrientation,
            },
          }
        );
      }),
    );
  }
}
