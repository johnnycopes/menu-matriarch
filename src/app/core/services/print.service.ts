import { Injectable } from '@angular/core';

import { IMenuEntry } from '@models/interfaces/menu-entry.interface';
import { IMenu } from '@models/interfaces/menu.interface';
import { Orientation } from '@models/types/orientation.type';

interface IPrintMenu extends Pick<IMenu,
  'name' | 'entries' | 'entryFallbackText' | 'entryOrientation'
>{ }

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private _popupWindow: Window | null = null;

  public printMenu(menu: IPrintMenu): void {
    if (this._popupWindow == null || this._popupWindow.closed) {
      this._popupWindow = window.open(undefined, '_blank', 'resizable,scrollbars,status');
      this._popupWindow?.document.open();
      this._popupWindow?.document.write(this._createDocument(menu));
      this._popupWindow?.document.close();
    } else {
      this._popupWindow.focus();
    };
  }

  private _createDocument({ name, entries, entryFallbackText, entryOrientation }: IPrintMenu): string {
    return `
      <html>
        <head>
          <title>${name}</title>
          <style>
            ${this._createStyles()}
          </style>
        </head>
        <body onload="window.print()">
          ${entries
            .map(entry => this._createEntry({
              entry,
              entryFallbackText,
              entryOrientation
            }))
            .join('')
          }
        </body>
      </html>
    `;
  }

  private _createEntry({ entry, entryFallbackText, entryOrientation }:
    { entry: IMenuEntry, entryFallbackText: string, entryOrientation: Orientation }
  ): string {
    const mains = entry.dishes
      .filter(dish => dish.type === 'main')
      .map((dish, index) => (entryOrientation === 'vertical' || index === 0 ? '' : '&nbsp') + `<li>${dish.name}</li>`)
      .join(entryOrientation === 'vertical' ? '' : ',');
    const sides = entry.dishes
      .filter(dish => dish.type === 'side')
      .map((dish, index) => (entryOrientation === 'vertical' || index === 0 ? '' : '&nbsp') + `<li>${dish.name}</li>`)
      .join(entryOrientation === 'vertical' ? '' : ',');
    const content = entry.dishes.length
      ? `<ul class="dishes mains ${entryOrientation}">${mains}</ul>
        <ul class="dishes sides ${entryOrientation}">${sides}</ul>`
      : `<p class="fallback">${entryFallbackText}</p>`;
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
        letter-spacing: 0.5px;
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
