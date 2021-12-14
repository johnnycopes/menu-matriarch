
import { Component, AfterContentInit, ContentChildren, QueryList, Input, TemplateRef, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { AnimatedComponent } from '@utility/generic/animated.component';
import { fadeInAnimation, visibilityAnimation } from '@utility/domain/animations';
import { trackByFactory } from '@utility/generic/track-by-factory';
import { TabComponent } from './tab/tab.component';

export type TabsetContentVisibility = 'visible' | 'invisible';

@Component({
  selector: 'app-tabset',
  templateUrl: './tabset.component.html',
  styleUrls: ['./tabset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInAnimation, visibilityAnimation]
})
export class TabsetComponent extends AnimatedComponent implements AfterViewInit, AfterContentInit, OnDestroy {
  @Input() controlsTemplate: TemplateRef<unknown> | undefined;
  @Input() contentVisibility: TabsetContentVisibility = 'visible';
  @ContentChildren(TabComponent)
  public tabs: QueryList<TabComponent> | undefined;
  public contentMaxHeight = '100%';
  public trackByFn = trackByFactory<TabComponent, string>(tab => tab.name);
  private _destroy$ = new Subject();

  @ViewChild('tabsElement')
  public tabsElement: ElementRef | undefined;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    super();
  }

  public ngAfterViewInit(): void {
    this.contentMaxHeight = `calc(100% - ${this.tabsElement?.nativeElement?.clientHeight ?? 0}px)`;
  }

  public ngAfterContentInit(): void {
    const selectedTab = this.tabs?.find(tab => tab.selected);

    if (!selectedTab && this.tabs?.first) {
      this.tabs.first.selected = true;
    }

    if (this.tabs) {
      merge(
        ...this.tabs.map(tab => tab.nameChange),
        ...this.tabs.map(tab => tab.selectedChange),
      ).pipe(
        takeUntil(this._destroy$),
        tap(() => this._changeDetectorRef.markForCheck())
      ).subscribe();
    }
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public onSelectTab(tab: TabComponent): void {
    this.tabs?.forEach(tab => tab.selected = false);
    tab.selected = true;
  }
}
