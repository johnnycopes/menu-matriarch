import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() { }

  public printMenu(): void {
    let popupWin;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100vh,width=auto');
    popupWin?.document.open();
    popupWin?.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <style>
          //........Customized style.......
          </style>
        </head>
        <body onload="window.print()">
          <h1>hey what's up</h1>
          <p>this is some dummy text</p>
        </body>
      </html>`
    );
    popupWin?.document.close();
  }
}
