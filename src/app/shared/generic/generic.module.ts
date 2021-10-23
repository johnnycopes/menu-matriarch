import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

import { AlertComponent } from './alert/alert.component';
import { AutofocusDirective } from './autofocus/autofocus.directive';
import { ButtonComponent } from './button/button.component';
import { CardComponent } from './card/card.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { HoverDirective } from './hover/hover.directive';
import { InputComponent } from './input/input.component';
import { KanbanBoardColumnComponent } from './kanban-board/kanban-board-column/kanban-board-column.component';
import { KanbanBoardComponent } from './kanban-board/kanban-board.component';
import { KanbanBoardFormComponent } from './kanban-board/kanban-board-form/kanban-board-form.component';
import { LetDirective } from './let/let.directive';
import { OptionsMenuComponent } from './options-menu/options-menu.component';
import { OptionsMenuItemComponent } from './options-menu/options-menu-item/options-menu-item.component';
import { OptionsMenuTriggerDirective } from './options-menu/options-menu-trigger.directive';
import { PanelComponent } from './panel/panel.component';
import { RangeDirective } from './range/range.directive';
import { SectionComponent } from './section/section.component';
import { SmallCapsLabelComponent } from './small-caps-label/small-caps-label.component';



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
    LetDirective,
    OptionsMenuComponent,
    OptionsMenuItemComponent,
    OptionsMenuTriggerDirective,
    PanelComponent,
    RangeDirective,
    SectionComponent,
    SmallCapsLabelComponent,
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
    LetDirective,
    OptionsMenuComponent,
    OptionsMenuItemComponent,
    OptionsMenuTriggerDirective,
    PanelComponent,
    RangeDirective,
    SectionComponent,
    SmallCapsLabelComponent,
  ]
})
export class GenericModule { }
