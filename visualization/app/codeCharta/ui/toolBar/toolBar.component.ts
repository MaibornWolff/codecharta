import "./toolBar.component.scss"
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
	constructor(private $rootScope: IRootScopeService) {
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
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
