import { NgModule } from "@angular/core"
import { ActionIconModule } from "../../actionIcon/actionIcon.module"
import { DownloadButtonComponent } from "./downloadButton.component"

@NgModule({
	imports: [ActionIconModule],
	declarations: [DownloadButtonComponent],
	exports: [DownloadButtonComponent],
	entryComponents: [DownloadButtonComponent]
})
export class DownloadButtonModule {}
