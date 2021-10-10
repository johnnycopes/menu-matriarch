import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IMenu, IMenuDbo } from '../models/interfaces/menu.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private _firestore: AngularFirestore) { }

  public getMenu(uid: string): Observable<IMenu> {
    return this._firestore
      .collection<IMenuDbo>(
        'menus',
        ref => ref.where('uid', '==', uid),
      )
      .valueChanges()
      .pipe(
        map(menus => menus[0].menu)
      );
  }
}
