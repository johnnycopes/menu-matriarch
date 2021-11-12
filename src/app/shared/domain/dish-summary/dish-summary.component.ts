import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { faMap } from '@fortawesome/free-regular-svg-icons';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';

import { TagService } from '@services/tag.service';

@Component({
  selector: 'app-dish-summary',
  templateUrl: './dish-summary.component.html',
  styleUrls: ['./dish-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishSummaryComponent {
  @Input() id: string = '';
  @Input() name: string = '';
  @Input() description: string | undefined;
  @Input() menus: string[] = [];
  @Input() usages: number = 0;
  @Input()
  public set tags(value: string[]) {
    this._tagIds$.next(value);
  }

  private _tagIds$ = new BehaviorSubject<string[]>([]);
  public tags$ = combineLatest([
    this._tagIds$.asObservable(),
    this._tagService.getTags()
  ]).pipe(
    map(([ids, tags]) => tags.filter(tag => ids.includes(tag.id)))
  );
  public readonly faMap = faMap;
  public readonly faCalendarDay = faCalendarDay;

  constructor(private _tagService: TagService) { }
}
