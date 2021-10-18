import { Component, Input, OnInit } from '@angular/core';
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { Day } from '@models/types/day.type';

@Component({
  selector: '[app-menu]',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @Input() name = '';
  @Input() selected: boolean = false;
  @Input() entries: IMenuEntry[] = [];
  @Input() days: Day[] = [];
  public faCheckCircle = faCheckCircle;

  constructor() { }

  ngOnInit(): void {
  }

}
