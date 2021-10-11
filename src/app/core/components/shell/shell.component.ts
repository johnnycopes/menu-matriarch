import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { routerTransition } from './router-transition';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routerTransition],
})
export class ShellComponent {

  constructor() { }

  public getState(outlet: RouterOutlet): string | undefined {
    return outlet?.activatedRouteData?.state;
  }
}
