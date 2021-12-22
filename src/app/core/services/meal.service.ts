import { Injectable } from '@angular/core';

import { Endpoint } from '@models/endpoint.enum';
import { BatchService } from './batch.service';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class MealService {
  private _endpoint = Endpoint.meals;

  constructor(
    private _firestoreService: FirestoreService,
    private _batchService: BatchService,
  ) { }
}
