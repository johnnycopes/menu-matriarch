import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Batch } from './batch';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private _firestoreService: FirestoreService) { }

  public createId(): string {
    return this._firestoreService.createId();
  }

  public createBatch(): Batch {
    return new Batch(this._firestoreService.createBatch());
  }

  public getOne<T>(endpoint: string, id: string | undefined): Observable<T | undefined> {
    return this._firestoreService.getOne(endpoint, id);
  }

  public getMany<T>(endpoint: string, uid: string | undefined): Observable<T[]> {
    return this._firestoreService.getMany(endpoint, uid);
  }

  public async create<T>(endpoint: string, id: string, details: T): Promise<void> {
    return this._firestoreService.create(endpoint, id, details);
  }

  public async update<T>(endpoint: string, id: string, updates: Partial<T>): Promise<void> {
    return await this._firestoreService.update(endpoint, id, updates);
  }

  public async delete<T>(endpoint: string, id: string): Promise<void> {
    return await this._firestoreService.delete(endpoint, id);
  }
}
