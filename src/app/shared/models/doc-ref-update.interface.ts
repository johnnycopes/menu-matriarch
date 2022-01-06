import { DocumentReference } from "@angular/fire/compat/firestore";
import firebase from 'firebase/compat/app';

export interface DocRefUpdate<T> {
  docRef: DocumentReference<T>;
  updates: firebase.firestore.UpdateData;
}
