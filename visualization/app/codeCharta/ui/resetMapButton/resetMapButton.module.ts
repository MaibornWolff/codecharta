import { CommonModule } from "@angular/common"
import { NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MaterialModule } from "../../../material/material.module"
import { ActionIconModule } from "../actionIcon/actionIcon.module"
import { ConfirmResetMapDialogComponent } from "./confirmResetMapDialog/confirmResetMapDialog.component"
import { ResetMapButtonComponent } from "./resetMapButton.component"

@NgModule({
	imports: [CommonModule, ActionIconModule, MaterialModule, ReactiveFormsModule, FormsModule],
	declarations: [ResetMapButtonComponent, ConfirmResetMapDialogComponent],
	exports: [ResetMapButtonComponent]
})
export class ResetMapButtonModule {}
