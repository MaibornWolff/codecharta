import "./toolBar.component.scss"
import { DialogService } from "../dialog/dialog.service"
import { CodeMapMouseEventService, BuildingUnhoveredSubscriber, BuildingHoveredSubscriber } from "../codeMap/codeMap.mouseEvent.service"
import { IRootScopeService } from "angular"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"

export class ToolBarController implements BuildingHoveredSubscriber, BuildingUnhoveredSubscriber {
	private _viewModel: {
		nodeHovered: boolean
	} = {
		nodeHovered: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private dialogService: DialogService) {
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
	}

	public downloadFile() {
		this.dialogService.showDownloadDialog()
	}

	public showGlobalSettings() {
		this.dialogService.showGlobalSettingsDialog()
	}

	public onBuildingHovered(data: CodeMapBuilding) {
		this._viewModel.nodeHovered = true
	}

	public onBuildingUnhovered() {
		this._viewModel.nodeHovered = false
	}
}

export const toolBarComponent = {
	selector: "toolBarComponent",
	template: require("./toolBar.component.html"),
	controller: ToolBarController
}
