import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { AddCustomConfigButtonComponent } from "./addCustomConfigButton.component"
import { AddCustomConfigDialogComponent } from "./addCustomConfigDialog/addCustomConfigDialog.component"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"

@NgModule({
	imports: [MaterialModule, ReactiveFormsModule, FormsModule, CommonModule],
	declarations: [AddCustomConfigButtonComponent, AddCustomConfigDialogComponent],
	exports: [AddCustomConfigButtonComponent]
})
export class AddCustomConfigButtonModule {}
