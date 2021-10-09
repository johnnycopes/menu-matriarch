import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';

import { IMeal } from '../models/meal.interface';
import { IUser } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user$ = this._auth.user;

  constructor(
    private _auth: AngularFireAuth,
    private _firestore: AngularFirestore,
  ) { }

  public async login() {
    const loginInfo = await this._auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    const id = loginInfo.user?.uid;
    if (id) {
      this._firestore
        .collection<IUser>('users').ref
        .doc(id)
        .set({ id });
    }
  }

  public logout(): void {
    this._auth.signOut();
  }
}
