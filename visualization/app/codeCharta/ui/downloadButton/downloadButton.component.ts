import "./downloadButton.component.scss"
import { DialogService } from "../dialog/dialog.service"

export class DownloadButtonController {
	/* @ngInject */
	constructor(private dialogService: DialogService) {}

	public downloadFile() {
		this.dialogService.showDownloadDialog()
	}
}

export const downloadButtonComponent = {
	selector: "downloadButtonComponent",
	template: require("./downloadButton.component.html"),
	controller: DownloadButtonController
}
