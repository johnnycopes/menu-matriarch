import { Injectable } from '@angular/core';

import { IMenuEntry } from '@models/interfaces/menu-entry.interface';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private _popupWindow: Window | null = null;

  public printMenu(name: string, entries: IMenuEntry[]): void {
    if (this._popupWindow == null || this._popupWindow.closed) {
      this._popupWindow = window.open(undefined, '_blank', 'resizable,scrollbars,status');
      this._popupWindow?.document.open();
      this._popupWindow?.document.write(this._createDocument(name, entries));
      this._popupWindow?.document.close();
    } else {
      this._popupWindow.focus();
    };
  }

  private _createDocument(name: string, entries: IMenuEntry[] = []): string {
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
            .map(this._createEntry)
            .join('')
          }
        </body>
      </html>
    `;
  }

  private _createEntry({ day, dishes }: IMenuEntry): string {
    const mains = dishes.filter(dish => dish.type === 'main');
    const sides = dishes.filter(dish => dish.type === 'side');
    return `<li class="entry">
      <h2 class="day">${day}</h2>
      <div class="meals">
        <p class="dishes mains">${mains.map((dish, index) => (index === 0 ? '' : '&nbsp') + dish.name)}</p>
        <p class="dishes sides">${sides.map((dish, index) => (index === 0 ? '' : '&nbsp') + dish.name)}</p>
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

      h1, h2, h3, h4, h5, h6, p {
        margin: 0;
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
        font-size: 12pt;
      }

      .mains {
        font-weight: bold;
      }
    `;
  }
}
