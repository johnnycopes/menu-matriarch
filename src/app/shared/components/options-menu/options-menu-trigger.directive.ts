import { Directive, HostListener, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from "@angular/core";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Directive({
  selector: '[appOptionsMenuTrigger]',
})
export class OptionsMenuTriggerDirective implements OnInit, OnDestroy {
  @Input('appOptionsMenuTrigger')
  public set template(template: TemplateRef<any>) {
    this._templatePortal = new TemplatePortal(template, this._viewContainerRef);
  }
  private _templatePortal: TemplatePortal<any> | undefined;
  private _overlayRef: OverlayRef = this._overlay.create({
    scrollStrategy: this._overlay.scrollStrategies.close(),
    positionStrategy: this._overlay.position()
      .flexibleConnectedTo(this._viewContainerRef.element.nativeElement)
      .withPositions([
        {
          originX: "end",
          originY: "bottom",
          overlayX: "end",
          overlayY: "top",
        }
      ]),
  });
  private _destroy$ = new Subject();

  constructor(
    private _viewContainerRef: ViewContainerRef,
    private _overlay: Overlay,
  ) { }

  public ngOnInit(): void {
    this._overlayRef.outsidePointerEvents()
      .pipe(
        takeUntil(this._destroy$)
      )
      .subscribe(
        ({ target }) => {
          if (target !== this._viewContainerRef.element.nativeElement) {
            this._overlayRef.detach()
          }
        },
      );
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  @HostListener('click')
  public onClick(): void {
    if (this._overlayRef.hasAttached()) {
      this._overlayRef.detach();
    } else {
      this._overlayRef.attach(this._templatePortal);
    }
  }
}
