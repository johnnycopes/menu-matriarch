import { Injectable } from '@angular/core';

import { Dish } from '@models/interfaces/dish.interface';
import { Menu } from '@models/interfaces/menu.interface';
import { MenuEntry } from '@models/interfaces/menu-entry.interface';
import { DishType } from '@models/types/dish-type.type';
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
    const mains = this._createDishesList(entry.dishes, 'main', orientation);
    const sides = this._createDishesList(entry.dishes, 'side', orientation);
    const desserts = this._createDishesList(entry.dishes, 'dessert', orientation);
    const meal = entry.dishes.length
      ? `<ul class="dishes main ${orientation}">${mains}</ul>
        <ul class="dishes side ${orientation}">${sides}</ul>
        <ul class="dishes dessert ${orientation}">${desserts}</ul>
        `
      : `<p class="fallback">${fallbackText}</p>`;
    return `<li class="entry">
      <h2 class="day">${entry.day}</h2>
      <div class="meal">
        ${meal}
      </div>
    </li>`;
  }

  private _createDishesList(dishes: Dish[], type: DishType, orientation: Orientation) {
    const list = dishes
      .filter(dish => dish.type === type)
      .map((dish, index) => (orientation === 'vertical' || index === 0 ? '' : '&nbsp') + `<li>${dish.name}</li>`)
      .join(orientation === 'vertical' ? '' : ',');
      console.log(list);
    return list;
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

      .meal {
        max-width: 256pt;
        margin-left: 4pt;
      }

      .dessert {
        font-style: italic;
      }

      .day {
        max-width: 256pt;
        font-size: 9pt;
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

      .main {
        font-weight: bold;
      }

      .fallback {
        font-style: italic;
      }
    `;
  }
}
