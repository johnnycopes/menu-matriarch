import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, switchMap, takeUntil } from 'rxjs/operators';

import { IUserPreferences } from '@models/interfaces/user.interface';
import { Day } from '@models/types/day.type';
import { ITag } from '@models/interfaces/tag.interface';
import { AuthService } from '@services/auth.service';
import { TagService } from '@services/tag.service';
import { UserService } from '@services/user.service';
import { getDays } from '@utility/get-days';
import { trackByFactory } from '@shared/utility/track-by-factory';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit, OnDestroy {
  public user$ = this._userService.getUser();
  public preferences$ = this._userService.getPreferences();
  public tags$ = this._tagService.getTags();
  public updateAction$ = new Subject<Partial<IUserPreferences>>();
  public dayTrackByFn = trackByFactory<Day, Day>(day => day);
  public tagTrackByFn = trackByFactory<ITag, string>(tag => tag.id);
  public days: Day[] = getDays();
  private _destroy$ = new Subject<void>();

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _tagService: TagService,
    private _userService: UserService,
  ) { }

  public ngOnInit(): void {
    this.updateAction$.pipe(
      takeUntil(this._destroy$),
      debounceTime(200),
      switchMap(update => this._userService.updatePreferences(update))
    ).subscribe();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public async signOut(): Promise<void> {
    try {
      await this._authService.logout();
      this._router.navigate(['/welcome']);
    } catch (e) {
      console.error(e);
    }
  }
}
