import { Component, OnInit, ViewContainerRef } from "@angular/core";
import { faAppleAlt, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { CheckboxState } from "@shared/components/checkbox/checkbox.component";
import { IKitchenLocation, KanbanBoardConfig } from "./kitchen-location";
import { IKanbanBoardConfig } from "@shared/components/kanban-board/kanban-board.component";

@Component({
	selector: "app-demo",
	templateUrl: "./demo.component.html",
	styleUrls: ["./demo.component.scss"]
})
export class DemoComponent implements OnInit {
	// AccordionComponent
	public sections: { title: string, description: string; }[] = [
		{
			title: "Section A",
			description: "This is section A. Content goes in this section. Additonal sentence here."
		},
		{
			title: "Section B",
			description: "This is section B. Content goes in this section. Additonal sentence here."
		},
		{
			title: "Section C",
			description: "This is section C. Content goes in this section. Additonal sentence here."
		},
	];

	// ButtonComponent
	public counter: number = 0;

	// CheckboxComponent
	public checkboxState1: CheckboxState = "indeterminate";
	public checkboxState2: CheckboxState = "unchecked";
	public checkboxState3: CheckboxState = "checked";

	// FontAwesomeComponent
	public faApple: IconDefinition = faAppleAlt;

	// HoverDirective
	public hoverState: boolean = false;

	// InputComponent
	public inputModel: string = "";

	// KanbanBoardComponent
	public kitchenLocations: IKitchenLocation[] = [
		{
			id: "01",
			name: "Refrigerator",
			items: [
				"Salmon",
				"Cheese",
				"Oat milk",
				"Mustard",
			]
		},
		{
			id: "02",
			name: "Freezer",
			items: [
				"Chicken",
				"Mixed veggies",
			]
		},
		{
			id: "03",
			name: "Pantry",
			items: [
				"Avocados",
				"Tomatoes",
				"Bell peppers",
				"Red onions",
				"Sweet pototoes",
			]
		}
	];
	public kanbanBoardConfig: IKanbanBoardConfig<IKitchenLocation, string> = new KanbanBoardConfig();

	constructor(
		private _viewContainerRef: ViewContainerRef
	) { }

	ngOnInit(): void {
	}

	public onButtonClick(): void {
		this.counter++;
	}
}
