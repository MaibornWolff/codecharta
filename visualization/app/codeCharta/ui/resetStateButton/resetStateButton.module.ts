import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from "../../../material/material.module"
import { ActionIconModule } from "../actionIcon/actionIcon.module"
import { ConfirmResetStateDialogComponent } from "./confirmResetStateDialog/confirmResetStateDialog.component"
import { ResetStateButtonComponent } from "./resetStateButton.component"

@NgModule({
	imports: [CommonModule, ActionIconModule, MaterialModule, ReactiveFormsModule, FormsModule],
	declarations: [ResetStateButtonComponent, ConfirmResetStateDialogComponent],
	exports: [ResetStateButtonComponent]
})
export class ResetStateButtonModule {}
