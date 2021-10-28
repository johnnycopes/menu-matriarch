import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IUser } from '@models/interfaces/user.interface';
import { FirestoreService } from './firestore.service';
import { MenuService } from './menu.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private _auth: AngularFireAuth,
    private _firestore: AngularFirestore,
    private _firestoreService: FirestoreService,
    private _menuService: MenuService,
  ) { }

  public get loggedIn$(): Observable<boolean> {
    return this._auth.user.pipe(
      map(Boolean)
    );
  }

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
        const newMenuId = await this._firestoreService.createMenu(uid, 'My First Menu');
        this._menuService.selectMenu(newMenuId);
        this._firestoreService.createUser({
          uid,
          displayName,
          email,
        });
      }
    }
  }

  public async logout(): Promise<void> {
    await this._auth.signOut();
  }
}
