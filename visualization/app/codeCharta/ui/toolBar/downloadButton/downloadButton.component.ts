import { Component, Inject, ViewEncapsulation } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { DownloadDialogComponent } from "./downloadDialog/downloadDialog.component"

@Component({
	selector: "cc-download-button",
	templateUrl: "./downloadButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class DownloadButtonComponent {
	constructor(@Inject(MatDialog) private dialog: MatDialog) {}

	download() {
		this.dialog.open(DownloadDialogComponent, { panelClass: "cc-download-dialog" })
	}
}
