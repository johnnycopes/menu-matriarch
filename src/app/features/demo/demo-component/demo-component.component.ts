import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { trackBySelf } from "@utility/domain/track-by-functions";

@Component({
	selector: "app-demo-component",
	templateUrl: "./demo-component.component.html",
	styleUrls: ["./demo-component.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoComponentComponent {
	@Input() name: string = '';
	@Input() description: string = '';
	@Input() dependencies: string[] = [];
	@Input() limitWidth: boolean = false;
  public readonly trackByFn = trackBySelf;
}
