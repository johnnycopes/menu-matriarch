
import { Component, AfterContentInit, ContentChildren, QueryList, Input, TemplateRef, ChangeDetectionStrategy } from '@angular/core';

import { fadeInAnimation, visibilityAnimation } from '@utility/animations';
import { AnimatedComponent } from '@utility/animated.component';
import { TabComponent } from './tab/tab.component';

export type TabsetContentVisibility = 'visible' | 'invisible';

@Component({
  selector: 'app-tabset',
  templateUrl: './tabset.component.html',
  styleUrls: ['./tabset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInAnimation, visibilityAnimation]
})
export class TabsetComponent extends AnimatedComponent implements AfterContentInit {
  @Input() controlsTemplate: TemplateRef<unknown> | undefined;
  @Input() contentVisibility: TabsetContentVisibility = 'visible';
  @ContentChildren(TabComponent)
  public tabs: QueryList<TabComponent> | undefined;

  public ngAfterContentInit(): void {
    const selectedTab = this.tabs?.find(tab => tab.selected);

    if (!selectedTab && this.tabs?.first) {
      this.tabs.first.selected = true;
    }
  }

  public onSelectTab(tab: TabComponent): void {
    this.tabs?.forEach(tab => tab.selected = false);
    tab.selected = true;
  }
}
