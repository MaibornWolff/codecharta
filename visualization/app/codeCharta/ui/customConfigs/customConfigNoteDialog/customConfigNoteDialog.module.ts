import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"
import { CustomConfigNoteDialogComponent } from "./customConfigNoteDialog.component"
import { ManageCustomConfigNoteDialogComponent } from "./manageCustomConfigNoteDialog/manageCustomConfigNoteDialog.component"
import { A11yModule } from "@angular/cdk/a11y"

@NgModule({
	imports: [MaterialModule, ReactiveFormsModule, FormsModule, CommonModule, A11yModule],
	declarations: [CustomConfigNoteDialogComponent, ManageCustomConfigNoteDialogComponent],
	exports: [CustomConfigNoteDialogComponent]
})
export class CustomConfigNoteDialogModule {}
