import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Day } from '../models/day.type';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor() { }

  getMenu(): Observable<{
    day: Day,
    meal: string | undefined,
  }[]> {
    return of([
      {
        day: 'Monday',
        meal: 'Pizza',
      },
      {
        day: 'Tuesday',
        meal: 'Sushi',
      },
      {
        day: 'Wednesday',
        meal: 'Banh Mi',
      },
      {
        day: 'Thursday',
        meal: 'Bagels',
      },
      {
        day: 'Friday',
        meal: 'Noodles',
      },
      {
        day: 'Saturday',
        meal: 'Lasagna',
      },
      {
        day: 'Sunday',
        meal: 'Tacos',
      },
    ]);
  }
}
