import { Component, ViewEncapsulation } from "@angular/core"
import { UrlExtractor } from "../../services/loadInitialFile/urlExtractor"
import { HttpClient } from "@angular/common/http"
import { MatDialog } from "@angular/material/dialog"
import { ConfirmResetStateDialogComponent } from "./confirmResetStateDialog/confirmResetStateDialog.component"

@Component({
	selector: "cc-reset-state-button",
	templateUrl: "./resetStateButton.component.html",
	encapsulation: ViewEncapsulation.None
})
export class ResetStateButtonComponent {
	private urlUtils = new UrlExtractor(this.httpClient)

	constructor(private dialog: MatDialog, private httpClient: HttpClient) {}

	showConfirmResetStateDialog() {
		this.dialog.open(ConfirmResetStateDialogComponent, { panelClass: "cc-confirm-reset-state-dialog" })
	}
}
