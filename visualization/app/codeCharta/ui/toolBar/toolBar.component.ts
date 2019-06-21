import "./toolBar.component.scss"
import { DialogService } from "../dialog/dialog.service"

export class ToolBarController {

    /* @ngInject */
    constructor(private dialogService: DialogService) {}

    public downloadFile() {
		this.dialogService.showDownloadDialog()
	}

	public showGlobalSettings() {
		this.dialogService.showGlobalSettingsDialog()
	}
}

export const toolBarComponent = {
    selector: "toolBarComponent",
    template: require("./toolBar.component.html"),
    controller: ToolBarController
}