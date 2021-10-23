import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';

import { IUser } from '@models/interfaces/user.interface';
import { FirestoreService } from './firestore.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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

  public updateUser(updates: Partial<IUser>): Observable<string | undefined> {
    return this._auth.user.pipe(
      take(1),
      map(user => user?.uid),
      tap(userId => this._firestoreService.updateUser(userId, updates))
    );
  }
}
