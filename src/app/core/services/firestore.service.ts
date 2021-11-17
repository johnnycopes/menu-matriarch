import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentReference } from '@angular/fire/compat/firestore';
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

  public getBatch() {
    return this._firestore.firestore.batch();
  }

  public getDocRef<T>(endpoint: string, id: string): DocumentReference<T> {
    return this._getDoc<T>(endpoint, id).ref;
  }

  public getOne<T>(endpoint: string, id: string | undefined): Observable<T | undefined> {
    if (!id) {
      return of(undefined);
    }
    return this
      ._getDoc<T>(endpoint, id)
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
        ref => ref.where('uid', '==', uid)
      )
      .valueChanges()
      .pipe(
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  public async create<T>(endpoint: string, id: string, details: T): Promise<void> {
    return await this
      ._getDoc<T>(endpoint, id)
      .set(details);
  }


  public async update<T>(endpoint: string, id: string, updates: Partial<T>): Promise<void> {
    return await this
      ._getDoc<T>(endpoint, id)
      .update(updates);
  }

  public async delete<T>(endpoint: string, id: string): Promise<void> {
    return await this
      ._getDoc<T>(endpoint, id)
      .delete();
  }

  public createId(): string {
    return this._firestore.createId();
  }

  private _getDoc<T>(endpoint: string, id: string): AngularFirestoreDocument<T> {
    return this._firestore
      .collection<T>(endpoint)
      .doc(id)
  }
}
