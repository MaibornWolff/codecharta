import "./downloadButton.standalone.component.scss"
import { DialogService } from "../dialog/dialog.service"

export class DownloadButtonStandaloneController {
	/* @ngInject */
	constructor(private dialogService: DialogService) {}

	public downloadFile() {
		this.dialogService.showErrorDialog("STANDALOOOOOONE")
	}
}

export const downloadButtonStandaloneComponent = {
	selector: "downloadButtonStandaloneComponent",
	template: require("./downloadButton.standalone.component.html"),
	controller: DownloadButtonStandaloneController
}
