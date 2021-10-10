import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IUserDbo } from '../models/dbos/user-dbo.interface';
import { IUserPreferences } from '../models/interfaces/user-preferences.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$ = this._auth.user;

  constructor(
    private _auth: AngularFireAuth,
    private _firestore: AngularFirestore,
  ) { }

  public async login(): Promise<void> {
    const loginInfo = await this._auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    if (loginInfo.user) {
      const { uid, displayName, email } = loginInfo.user;
      const user = await this._firestore
        .collection<IUserDbo>(
          'users',
          ref => ref.where('id', '==', uid),
        )
        .ref
        .get();

      if (!user.docs.length) {
        this._firestore
          .collection<IUserDbo>('users')
          .ref
          .add({
            id: uid,
            name: displayName ?? 'friend',
            email: email ?? undefined,
            preferences: {
              darkMode: false,
              dayNameDisplay: 'full',
              menuStartDay: 'Monday',
            },
          });
      }
    }
  }

  public logout(): void {
    this._auth.signOut();
  }

  public getPreferences(userId: string): Observable<IUserPreferences> {
    return this._firestore
      .collection<IUserDbo>(
        'users',
        ref => ref.where('userId', '==', userId),
      )
      .valueChanges()
      .pipe(
        map(users => users[0].preferences)
      );
  }
}
