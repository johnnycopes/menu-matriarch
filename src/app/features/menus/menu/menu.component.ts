import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

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
  @Input() entries: IMenuEntry[] = [];
  @Input() days: Day[] = [];
  public faEllipsisV = faEllipsisV;
  public renaming = false;

  constructor(private _cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  public onEdit(): void {
    console.log('edit');
  }

  public onRename(name: string): void {
    console.log(name);
    this.toggleRenaming();
  }

  public onDelete(): void {
    console.log('delete');
  }

  public toggleRenaming(): void {
    this.renaming = !this.renaming;
    this._cdRef.markForCheck();
  }
}
