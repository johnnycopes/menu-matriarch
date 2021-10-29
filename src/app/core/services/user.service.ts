import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map, shareReplay, switchMap, tap } from 'rxjs/operators';

import { IUser, IUserPreferences } from '@models/interfaces/user.interface';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _preferencesSubject$ = new BehaviorSubject<IUserPreferences | undefined>({
    darkMode: false,
    dayNameDisplay: 'full',
    emptyMealText: 'undecided',
    menuStartDay: 'Monday',
  });
  public preferences$ = this._preferencesSubject$.asObservable();

  constructor(
    private _auth: AngularFireAuth,
    private _firestoreService: FirestoreService,
  ) {
    this.getPreferences().subscribe(
      preferences => this._preferencesSubject$.next(preferences)
    );
  }

  public get uid$() {
    return this._auth.user.pipe(
      map(user => user?.uid),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }

  public getUser(): Observable<IUser | undefined> {
    return this.uid$.pipe(
      switchMap(this._firestoreService.getUser),
    );
  }

  public getPreferences(): Observable<IUserPreferences | undefined> {
    return this.uid$.pipe(
      switchMap(this._firestoreService.getUser),
      map(user => user?.preferences),
    );
  }

  public updatePreferences(updates: Partial<IUserPreferences>): Observable<IUser | undefined> {
    return this.uid$.pipe(
      switchMap(this._firestoreService.getUser),
      first(),
      tap(async user => {
        const fallbackPreferences = user?.preferences ?? {
          darkMode: false,
          dayNameDisplay: 'full',
          emptyMealText: 'undecided',
          menuStartDay: 'Monday',
        };
        await this._firestoreService.updateUser(
          user?.uid,
          { preferences: {
            darkMode: updates?.darkMode ?? fallbackPreferences.darkMode,
            dayNameDisplay: updates?.dayNameDisplay ?? fallbackPreferences.dayNameDisplay,
            emptyMealText: updates?.emptyMealText ?? fallbackPreferences.emptyMealText,
            menuStartDay: updates?.menuStartDay ?? fallbackPreferences.menuStartDay,
          },
        });
      }),
    );
  }
}
