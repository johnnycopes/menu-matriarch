import { Component, Input, ChangeDetectionStrategy } from "@angular/core";

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
}
