import { Component, Inject } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { DownloadDialogComponent } from "./downloadDialog/downloadDialog.component"

@Component({
	selector: "cc-download-button",
	template: require("./downloadButton.component.html")
})
export class DownloadButtonComponent {
	constructor(@Inject(MatDialog) private dialog: MatDialog) {}

	download() {
		this.dialog.open(DownloadDialogComponent, { panelClass: "cc-download-dialog" })
	}
}
