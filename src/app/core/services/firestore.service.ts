import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, of } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private _firestore: AngularFirestore) { }

  public get firestore() {
    return this._firestore;
  }

  public getOne<T>(endpoint: string, uid: string | undefined): Observable<T | undefined> {
    return this._firestore
      .collection<T | undefined>(endpoint)
      .doc(uid)
      .valueChanges()
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  public getMany<T>(endpoint: string, uid: string | undefined): Observable<T[]> {
    if (!uid) {
      return of([]);
    }
    return this._firestore
      .collection<T>(
        endpoint,
        ref => ref
          .where('uid', '==', uid)
          .orderBy('name')
      )
      .valueChanges()
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  public async create<T>(endpoint: string, id: string, details: T): Promise<void> {
    return await this._firestore
      .collection<T>(endpoint)
      .doc(id)
      .set(details);
  }


  public async update<T>(endpoint: string, id: string, updates: Partial<T>): Promise<void> {
    return await this._firestore
      .collection<T>(endpoint)
      .doc(id)
      .update(updates);
  }

  public async delete<T>(endpoint: string, id: string | undefined): Promise<void> {
    return await this._firestore
      .collection<T>(endpoint)
      .doc(id)
      .delete();
  }

  public createId(): string {
    return this._firestore.createId();
  }
}
