import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { IconDefinition, faPlus } from '@fortawesome/free-solid-svg-icons';
import { NgForm } from '@angular/forms';

@Component({
	selector: 'app-kanban-board-form',
	templateUrl: './kanban-board-form.component.html',
	styleUrls: ['./kanban-board-form.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanbanBoardFormComponent {
	@Input() name: string = '';
	@Output() add: EventEmitter<string> = new EventEmitter();
	public addNewIcon: IconDefinition = faPlus;
	public adding: boolean = false;
	public model: string = '';

	public submitForm(form: NgForm): void {
		this.add.emit(this.model);
		this.resetForm(form);
	}

	public resetForm(form: NgForm): void {
		form.resetForm();
		this.adding = false;
	}
}
