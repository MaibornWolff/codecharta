import "./toolBar.component.scss"
import { CodeMapMouseEventService, BuildingUnhoveredSubscriber, BuildingHoveredSubscriber } from "../codeMap/codeMap.mouseEvent.service"
import { IRootScopeService } from "angular"

export class ToolBarController implements BuildingHoveredSubscriber, BuildingUnhoveredSubscriber {
	private _viewModel: {
		isNodeHovered: boolean
	} = {
		isNodeHovered: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService) {
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
	}

	onBuildingHovered() {
		this._viewModel.isNodeHovered = true
	}

	onBuildingUnhovered() {
		this._viewModel.isNodeHovered = false
	}
}

export const toolBarComponent = {
	selector: "toolBarComponent",
	template: require("./toolBar.component.html"),
	controller: ToolBarController
}
