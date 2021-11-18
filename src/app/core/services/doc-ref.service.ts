import { Injectable } from '@angular/core';
import { DocumentReference } from '@angular/fire/compat/firestore';

import { Endpoint } from '@models/enums/endpoint.enum';
import { DishDbo } from '@models/dbos/dish-dbo.interface';
import { MenuDbo } from '@models/dbos/menu-dbo.interface';
import { TagDbo } from '@models/dbos/tag-dbo.interface';
import { UserDbo } from '@models/dbos/user-dbo.interface';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class DocRefService {

  constructor(private _firestoreService: FirestoreService) { }

  public getDish(id: string): DocumentReference<DishDbo> {
    return this._firestoreService.getDocRef<DishDbo>(Endpoint.dishes, id);
  }

  public getMenu(id: string): DocumentReference<MenuDbo> {
    return this._firestoreService.getDocRef<MenuDbo>(Endpoint.menus, id);
  }

  public getTag(id: string): DocumentReference<TagDbo> {
    return this._firestoreService.getDocRef<TagDbo>(Endpoint.tags, id);
  }

  public getUser(id: string): DocumentReference<UserDbo> {
    return this._firestoreService.getDocRef<UserDbo>(Endpoint.users, id);
  }
}
