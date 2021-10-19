import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ERoute } from '@models/enums/route.enum';

interface ILink {
  name: string;
  route: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  public links: ILink[] = [
    {
      name: 'Welcome',
      route: ERoute.welcome,
    },
    {
      name: 'Planner',
      route: ERoute.planner,
    },
    {
      name: 'Menus',
      route: ERoute.menus,
    },
    {
      name: 'Meals',
      route: ERoute.meals,
    },
    {
      name: 'Demo',
      route: ERoute.demo,
    },
  ];
}
