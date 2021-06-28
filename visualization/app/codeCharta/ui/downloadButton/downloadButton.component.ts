import "./downloadButton.component.scss"
import { DialogService } from "../dialog/dialog.service"

export class DownloadButtonController {
	constructor(private dialogService: DialogService) {
		"ngInject"
	}

	downloadFile() {
		this.dialogService.showDownloadDialog()
	}
}

export const downloadButtonComponent = {
	selector: "downloadButtonComponent",
	template: require("./downloadButton.component.html"),
	controller: DownloadButtonController
}
