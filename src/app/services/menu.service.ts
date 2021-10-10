import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { IMenu, IMenuDbo } from '../models/interfaces/menu.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private _firestore: AngularFirestore,
    private _authService: AuthService,
  ) { }

  public getMenu(): Observable<IMenu | undefined> {
    return this._authService.uid$.pipe(
      switchMap(uid => {
        return this._firestore
          .collection<IMenuDbo>(
            'menus',
            ref => ref.where('uid', '==', uid),
          )
          .valueChanges()
          .pipe(
            map(menus => menus?.[0]?.menu)
          );
      })
    );
  }
}
