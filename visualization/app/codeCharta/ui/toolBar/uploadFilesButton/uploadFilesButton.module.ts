import { NgModule } from "@angular/core"
import { ActionIconModule } from "../../actionIcon/actionIcon.module"
import { UploadFilesButtonComponent } from "./uploadFilesButton.component"

@NgModule({
	imports: [ActionIconModule],
	declarations: [UploadFilesButtonComponent],
	exports: [UploadFilesButtonComponent]
})
export class UploadFilesButtonModule {}
