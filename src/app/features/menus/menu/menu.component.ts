import { Component, Input, OnInit } from '@angular/core';

import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { Day } from '@models/types/day.type';

@Component({
  selector: '[app-menu]',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() id = '';
  @Input() name = '';
  @Input() selected: boolean = false;
  @Input() entries: IMenuEntry[] = [];
  @Input() days: Day[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
