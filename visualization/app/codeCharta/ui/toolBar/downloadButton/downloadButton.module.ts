import { NgModule } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MaterialModule } from "../../../../material/material.module"
import { ActionIconModule } from "../../actionIcon/actionIcon.module"
import { DownloadButtonComponent } from "./downloadButton.component"
import { DownloadDialogComponent } from "./downloadDialog/downloadDialog.component"

@NgModule({
	imports: [ActionIconModule, MaterialModule, FormsModule],
	declarations: [DownloadButtonComponent, DownloadDialogComponent],
	exports: [DownloadButtonComponent]
})
export class DownloadButtonModule {}
