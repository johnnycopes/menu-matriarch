import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { FormsModule } from "@angular/forms";

import { AlertComponent } from "./components/alert/alert.component";
import { AutofocusDirective } from "./directives/autofocus/autofocus.directive";
import { ButtonComponent } from "./components/button/button.component";
import { CardComponent } from './components/card/card.component';
import { CheckboxComponent } from "./components/checkbox/checkbox.component";
import { HoverDirective } from "./directives/hover/hover.directive";
import { InputComponent } from "./components/input/input.component";
import { KanbanBoardColumnComponent } from "./components/kanban-board/kanban-board-column/kanban-board-column.component";
import { KanbanBoardComponent } from "./components/kanban-board/kanban-board.component";
import { KanbanBoardFormComponent } from "./components/kanban-board/kanban-board-form/kanban-board-form.component";
import { OptionsMenuComponent } from "./components/options-menu/options-menu.component";
import { OptionsMenuItemComponent } from "./components/options-menu/options-menu-item/options-menu-item.component";
import { OptionsMenuTriggerDirective } from "./components/options-menu/options-menu-trigger.directive";
import { PanelComponent } from "./components/panel/panel.component";
import { RangeDirective } from "./directives/range/range.directive";



@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    FontAwesomeModule,
    FormsModule,
  ],
  declarations: [
    AlertComponent,
    AutofocusDirective,
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    HoverDirective,
    InputComponent,
    KanbanBoardColumnComponent,
    KanbanBoardComponent,
    KanbanBoardFormComponent,
    OptionsMenuComponent,
    OptionsMenuItemComponent,
    OptionsMenuTriggerDirective,
    PanelComponent,
    RangeDirective,
  ],
  exports: [
    AlertComponent,
    AutofocusDirective,
    ButtonComponent,
    CardComponent,
    CheckboxComponent,
    HoverDirective,
    InputComponent,
    KanbanBoardColumnComponent,
    KanbanBoardComponent,
    KanbanBoardFormComponent,
    OptionsMenuComponent,
    OptionsMenuItemComponent,
    OptionsMenuTriggerDirective,
    PanelComponent,
    RangeDirective,
  ]
})
export class SharedModule { }
