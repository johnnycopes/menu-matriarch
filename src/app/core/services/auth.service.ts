import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { IUser } from '@models/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _auth: AngularFireAuth,
    private _firestore: AngularFirestore,
  ) { }

  public async login(): Promise<void> {
    const loginInfo = await this._auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    if (loginInfo.user) {
      const { uid, displayName, email } = loginInfo.user;
      const user = await this._firestore
        .collection<IUser>('users')
        .doc(uid)
        .ref
        .get();

      if (!user.exists) {
        this._firestore
          .collection<IUser>('users')
          .doc(uid)
          .set({
            uid,
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

  public getData<T>(dataFn: (uid?: string) => Observable<T>) {
    return this._auth.user.pipe(
      map(user => user?.uid),
      switchMap(dataFn)
    );
  }

  public getUser(): Observable<IUser | undefined> {
    return this.getData(this._getUser);
  }

  private _getUser = (uid?: string): Observable<IUser | undefined> => {
    return this._firestore
      .collection<IUser | undefined>('users')
      .doc(uid)
      .valueChanges();
  }
}
