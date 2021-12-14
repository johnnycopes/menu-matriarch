import { Component, Input, ChangeDetectionStrategy } from "@angular/core";
import { trackByFactory } from "@utility/generic/track-by-factory";

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
  public trackByFn = trackByFactory<string, string>(dependency => dependency);
}
