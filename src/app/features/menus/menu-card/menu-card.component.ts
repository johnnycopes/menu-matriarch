import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { merge, Subject } from 'rxjs';
import { mapTo } from 'rxjs/operators';

import { MenuEntry } from '@models/menu-entry.interface';
import { Orientation } from '@models/orientation.type';
import { MenuService } from '@services/menu.service';
import { PrintService } from '@services/print.service';
import { trackByDay } from '@utility/domain/track-by-functions';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '[app-menu-card]',
  templateUrl: './menu-card.component.html',
  styleUrls: ['./menu-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuCardComponent {
  @Input() id = '';
  @Input() name = '';
  @Input() entries: MenuEntry[] = [];
  @Input() orientation: Orientation = 'horizontal';
  @Input() fallbackText = '';
  @Input() canDelete = true;
  public readonly menuToggleIcon = faEllipsisV;
  public readonly trackByFn = trackByDay;
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
      fallbackText: this.fallbackText,
      orientation: this.orientation,
    });
  }

  public async onRename(name: string): Promise<void> {
    await this._menuService.updateMenuName(this.id, name);
    this.finishRename$.next();
  }

  public onChangeStartDay(): void {
    // TODO: save start day change here
  }

  public onDelete(): void {
    this._menuService.deleteMenu(this.id);
  }
}
