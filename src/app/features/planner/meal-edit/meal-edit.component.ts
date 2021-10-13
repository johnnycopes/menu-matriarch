import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute } from '@angular/router';

import { IMeal } from '@models/interfaces/meal.interface';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-meal-edit',
  templateUrl: './meal-edit.component.html',
  styleUrls: ['./meal-edit.component.scss']
})
export class MealEditComponent implements OnInit {
  public meal$ = this._route.params.pipe(
    switchMap(({ mealId }) => {
      if (!mealId) {
        return of(undefined);
      }
      return this._firestore
        .doc<IMeal>(`meals/${mealId}`)
        .valueChanges()
    })
  );

  constructor(
    private _route: ActivatedRoute,
    private _firestore: AngularFirestore,
  ) { }

  ngOnInit(): void {
  }

}
