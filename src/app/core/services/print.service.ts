import { Injectable } from '@angular/core';

import { MenuEntry } from '@models/interfaces/menu-entry.interface';
import { Menu } from '@models/interfaces/menu.interface';
import { Orientation } from '@models/types/orientation.type';

interface PrintMenu extends Pick<Menu,
  'name' | 'entries' | 'fallbackText' | 'orientation'
>{ }

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private _popupWindow: Window | null = null;

  public printMenu(menu: PrintMenu): void {
    if (this._popupWindow == null || this._popupWindow.closed) {
      this._popupWindow = window.open(undefined, '_blank', 'resizable,scrollbars,status');
      this._popupWindow?.document.open();
      this._popupWindow?.document.write(this._createDocument(menu));
      this._popupWindow?.document.close();
    } else {
      this._popupWindow.focus();
    };
  }

  private _createDocument({ name, entries, fallbackText, orientation }: PrintMenu): string {
    return `
      <html>
        <head>
          <title>Menu Matriarch | ${name}</title>
          <style>
            ${this._createStyles()}
          </style>
        </head>
        <body onload="window.print()">
          <h1 class="menu-name">${name}</h1>
          ${entries
            .map(entry => this._createEntry({
              entry,
              fallbackText,
              orientation,
            }))
            .join('')
          }
        </body>
      </html>
    `;
  }

  private _createEntry({ entry, fallbackText, orientation }:
    { entry: MenuEntry, fallbackText: string, orientation: Orientation }
  ): string {
    const mains = entry.dishes
      .filter(dish => dish.type === 'main')
      .map((dish, index) => (orientation === 'vertical' || index === 0 ? '' : '&nbsp') + `<li>${dish.name}</li>`)
      .join(orientation === 'vertical' ? '' : ',');
    const sides = entry.dishes
      .filter(dish => dish.type === 'side')
      .map((dish, index) => (orientation === 'vertical' || index === 0 ? '' : '&nbsp') + `<li>${dish.name}</li>`)
      .join(orientation === 'vertical' ? '' : ',');
    const content = entry.dishes.length
      ? `<ul class="dishes mains ${orientation}">${mains}</ul>
        <ul class="dishes sides ${orientation}">${sides}</ul>`
      : `<p class="fallback">${fallbackText}</p>`;
    return `<li class="entry">
      <h2 class="day">${entry.day}</h2>
      <div class="meals">
        ${content}
      </div>
    </li>`;
  }

  private _createStyles(): string {
    return `
      * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact;
      }

      body {
        margin: 16pt;
        line-height: 1.5;
        color: #222;
      }

      @page {
        size: landscape;
      }

      @media print {
        body {
          margin: 0;
          margin-top: 8pt;
        }
      }

      h1, h2, h3, h4, h5, h6, ul, ol, p {
        margin: 0;
        padding: 0;
        font-weight: normal;
      }

      ul, li {
        list-style: none;
      }

      body {
        font-family: 'Georgia';
      }

      .menu-name {
        margin-bottom: 8pt;
        font-size: 14pt;
      }

      .entry {
        margin-bottom: 8pt;
      }

      .meals {
        max-width: 256pt;
        margin-left: 4pt;
      }

      .day {
        max-width: 256pt;
        font-size: 8pt;
        letter-spacing: 0.5pt;
        text-transform: uppercase;
        border-bottom: 1px solid #e2e2e2;
      }

      .dishes {
        display: flex;
        font-size: 12pt;
      }

      .horizontal {
        flex-wrap: wrap;
      }

      .vertical {
        flex-direction: column;
      }

      .mains {
        font-weight: bold;
      }

      .fallback {
        font-style: italic;
      }
    `;
  }
}
