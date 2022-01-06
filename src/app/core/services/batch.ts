import { DocumentReference } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

export class Batch {

  constructor(private _batch: firebase.firestore.WriteBatch) { }

  public set<T>(documentRef: DocumentReference<T>, data: T): firebase.firestore.WriteBatch {
    return this._batch.set<T>(documentRef, data);
  }

  public update(documentRef: DocumentReference<any>, updates: firebase.firestore.UpdateData): firebase.firestore.WriteBatch {
    return this._batch.update(documentRef, updates);
  }

  public delete(documentRef: DocumentReference<any>): firebase.firestore.WriteBatch {
    return this._batch.delete(documentRef);
  }

  public commit(): Promise<void> {
    return this._batch.commit();
  }
}
