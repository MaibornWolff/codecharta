import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { AddCustomConfigButtonComponent } from "./addCustomConfigButton.component"
import { AddCustomConfigDialogComponent } from "./addCustomConfigDialog/addCustomConfigDialog.component"

@NgModule({
	imports: [MaterialModule],
	declarations: [AddCustomConfigButtonComponent, AddCustomConfigDialogComponent],
	exports: [AddCustomConfigButtonComponent]
})
export class AddCustomConfigButtonModule {}
