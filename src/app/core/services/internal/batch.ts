import { DocumentReference } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';

import { DocRefUpdate } from '@models/doc-ref-update.interface';

export class Batch {

  constructor(
    private _batch: firebase.firestore.WriteBatch,
    private _getDocRef: <T>(endpoint: string, id: string) => DocumentReference<T>,
  ) { }

  public set<T>({ endpoint, id, data }: {
    endpoint: string,
    id: string,
    data: T,
  }): Batch {
    const docRef = this._getDocRef<T>(endpoint, id);
    this._batch.set<T>(docRef, data);
    return this;
  }

  public update({ endpoint, id, updates }: {
    endpoint: string,
    id: string,
    updates: { [key: string]: any },
  }): Batch {
    const docRef = this._getDocRef(endpoint, id);
    this._batch.update(docRef, updates);
    return this;
  }

  public updateMultiple(docRefUpdates: DocRefUpdate<any>[]): Batch {
    docRefUpdates.forEach(
      ({ docRef, updates }) => this._batch.update(docRef, updates)
    );
    return this;
  }

  public delete(endpoint: string, id: string): Batch {
    const docRef = this._getDocRef(endpoint, id);
    this._batch.delete(docRef);
    return this;
  }

  public commit(): Promise<void> {
    return this._batch.commit();
  }
}
