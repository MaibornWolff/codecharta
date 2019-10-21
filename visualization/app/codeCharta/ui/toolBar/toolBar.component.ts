import "./toolBar.component.scss"
import { DialogService } from "../dialog/dialog.service"
import { BuildingHoveredEventSubscriber, CodeMapMouseEventService, CodeMapBuildingTransition } from "../codeMap/codeMap.mouseEvent.service"
import { IRootScopeService } from "angular"

export class ToolBarController implements BuildingHoveredEventSubscriber {
	private _viewModel: {
		nodeHovered: boolean
	} = {
		nodeHovered: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService, private dialogService: DialogService) {
		CodeMapMouseEventService.subscribeToBuildingHoveredEvents(this.$rootScope, this)
	}

	public downloadFile() {
		this.dialogService.showDownloadDialog()
	}

	public showGlobalSettings() {
		this.dialogService.showGlobalSettingsDialog()
	}

	public onBuildingHovered(data: CodeMapBuildingTransition) {
		if (data.to && data.to.node) {
			this._viewModel.nodeHovered = true
		} else {
			this._viewModel.nodeHovered = false
		}
	}
}

export const toolBarComponent = {
	selector: "toolBarComponent",
	template: require("./toolBar.component.html"),
	controller: ToolBarController
}
