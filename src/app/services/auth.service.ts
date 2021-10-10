import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';

import { IUser, IUserDbo } from '../models/interfaces/user.interface';

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
        .collection<IUserDbo>('users')
        .doc(uid)
        .ref
        .get();

      if (!user.exists) {
        this._firestore
          .collection<IUserDbo>('users')
          .doc(uid)
          .set({
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

  public getUser(uid: string): Observable<IUser | undefined> {
    return this._firestore
      .collection<IUserDbo | undefined>('users')
      .doc(uid)
      .valueChanges();
  }
}
