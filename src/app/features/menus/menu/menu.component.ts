import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { Day } from '@models/types/day.type';
import { MenuService } from '@services/menu.service';

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

  constructor(
    private _cdRef: ChangeDetectorRef,
    private _menuService: MenuService,
  ) { }

  ngOnInit(): void {
  }

  public async onRename(name: string): Promise<void> {
    await this._menuService.updateMenuName(this.id, name);
    this.toggleRenaming();
  }

  public onDelete(): void {
    this._menuService.deleteMenu(this.id);
  }

  public toggleRenaming(): void {
    this.renaming = !this.renaming;
    this._cdRef.markForCheck();
  }
}
