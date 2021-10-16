import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { IUser } from '@models/interfaces/user.interface';
import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _userId: string | undefined;

  constructor(
    private _auth: AngularFireAuth,
    private _firestoreService: FirestoreService,
  ) {
    this._auth.user.pipe(
      map(user => user?.uid),
    ).subscribe(userId => this._userId = userId);
  }

  public getData<T>(dataFn: (uid: string | undefined) => Observable<T>): Observable<T> {
    return this._auth.user.pipe(
      map(user => user?.uid),
      switchMap(dataFn)
    );
  }

  public updateData<T>(
    dataFn: (uid: string | undefined, data: T) => Promise<void>
  ): (data: T) => Promise<void> {
    return (data: T) => dataFn(this._userId, data);
  }

  public getUser(): Observable<IUser | undefined> {
    return this.getData(this._firestoreService.getUser);
  }

  public async updateUser(updates: Partial<IUser>): Promise<void> {
    const updateFn = this.updateData(this._firestoreService.updateUser);
    await updateFn(updates);
  }
}
