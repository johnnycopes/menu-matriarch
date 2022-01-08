import { DocumentReference } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

import { DocRefUpdate } from '@models/doc-ref-update.interface';

export class Batch {

  constructor(private _batch: firebase.firestore.WriteBatch) { }

  public set<T>(documentRef: DocumentReference<T>, data: T): Batch {
    this._batch.set<T>(documentRef, data);
    return this;
  }

  public update(documentRef: DocumentReference<any>, updates: firebase.firestore.UpdateData): Batch {
    this._batch.update(documentRef, updates);
    return this;
  }

  public updateMultiple(docRefUpdates: DocRefUpdate<any>[]): Batch {
    docRefUpdates.forEach(
      ({ docRef, updates }) => this._batch.update(docRef, updates)
    );
    return this;
  }

  public delete(documentRef: DocumentReference<any>): Batch {
    this._batch.delete(documentRef);
    return this;
  }

  public commit(): Promise<void> {
    return this._batch.commit();
  }
}
