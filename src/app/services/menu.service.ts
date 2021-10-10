import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IMenuDbo } from '../models/dbos/menu-dbo.interface';
import { IMenu } from '../models/interfaces/menu.interface';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private _firestore: AngularFirestore) { }

  getMenu(userId: string): Observable<IMenu> {
    return this._firestore
      .collection<IMenuDbo>(
        'menus',
        ref => ref.where('userId', '==', userId),
      )
      .valueChanges()
      .pipe(
        map(menus => menus[0].menu)
      );
  }
}
