import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { UserDto } from '@models/dtos/user-dto.interface';
import { Endpoint } from '@models/endpoint.enum';
import { User } from '@models/user.interface';
import { UserPreferences } from '@models/user-preferences.interface';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class UserDocumentService {
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

  public getPreferences(): Observable<UserPreferences | undefined> {
    return this.getUser().pipe(
      map(user => user?.preferences),
    );
  }

  public updatePreferences(user: User, updates: Partial<UserPreferences>): Promise<void> {
    const { uid, preferences } = user;
    return this._firestoreService.update<UserDto>(
      this._endpoint,
      uid,
      { preferences: {
        ...preferences,
        ...updates,
      }}
    );
  }
}
