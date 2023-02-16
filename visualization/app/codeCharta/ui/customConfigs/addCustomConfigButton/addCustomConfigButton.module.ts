import { NgModule } from "@angular/core"
import { MaterialModule } from "../../../../material/material.module"
import { AddCustomConfigButtonComponent } from "./addCustomConfigButton.component"
import { AddCustomConfigDialogComponent } from "./addCustomConfigDialog/addCustomConfigDialog.component"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"
import { DownloadAndPurgeConfigsComponent } from "./addCustomConfigDialog/downloadAndPurgeConfigs/downloadAndPurgeConfigs.component"
import { CustomConfigNoteDialogModule } from "../customConfigNoteDialog/customConfigNoteDialog.module"

@NgModule({
	imports: [MaterialModule, ReactiveFormsModule, FormsModule, CommonModule, CustomConfigNoteDialogModule],
	declarations: [AddCustomConfigButtonComponent, AddCustomConfigDialogComponent, DownloadAndPurgeConfigsComponent],
	exports: [AddCustomConfigButtonComponent]
})
export class AddCustomConfigButtonModule {}
