import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'menu-matriarch';

  constructor(private firestore: AngularFirestore) {}

  ngOnInit(): void {
    console.log("hi", this.firestore);
  }
}
