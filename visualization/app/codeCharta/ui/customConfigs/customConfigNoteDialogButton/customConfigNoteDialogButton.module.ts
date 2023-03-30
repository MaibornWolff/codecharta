import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"
import { CustomConfigNoteDialogButtonComponent } from "./customConfigNoteDialogButton.component"
import { CustomConfigNoteDialogComponent } from "./customConfigNoteDialog/customConfigNoteDialog.component"
import { A11yModule } from "@angular/cdk/a11y"

@NgModule({
	imports: [MaterialModule, ReactiveFormsModule, FormsModule, CommonModule, A11yModule],
	declarations: [CustomConfigNoteDialogButtonComponent, CustomConfigNoteDialogComponent],
	exports: [CustomConfigNoteDialogButtonComponent]
})
export class CustomConfigNoteDialogButtonModule {}
