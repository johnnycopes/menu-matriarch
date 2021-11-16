import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { merge, Subject } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { Day } from '@models/types/day.type';
import { Orientation } from '@models/types/orientation.type';
import { MenuService } from '@services/menu.service';
import { PrintService } from '@services/print.service';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: '[app-menu]',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() entries: IMenuEntry[] = [];
  @Input() orientation: Orientation = 'horizontal';
  @Input() fallbackText = '';
  @Input() canDelete = true;
  public readonly faEllipsisV = faEllipsisV;
  public trackByFn = trackByFactory<IMenuEntry, Day>(entry => entry.day);
  public renaming = false;
  public startRename$ = new Subject<void>();
  public finishRename$ = new Subject<void>();
  public renaming$ = merge(
    this.startRename$.pipe(mapTo(true)),
    this.finishRename$.pipe(mapTo(false)),
  );

  constructor(
    private _menuService: MenuService,
    private _printService: PrintService,
  ) { }

  public onPrint(): void {
    this._printService.printMenu({
      name: this.name,
      entries: this.entries,
      entryFallbackText: this.fallbackText,
      entryOrientation: this.orientation,
    });
  }

  public async onRename(name: string): Promise<void> {
    await this._menuService.updateMenuName(this.id, name);
    this.finishRename$.next();
  }

  public onDelete(): void {
    this._menuService.deleteMenu(this.id);
  }
}
