import "./nodePathPanel.component.scss"
import { BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { IRootScopeService } from "angular"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"

export class NodePathPanelController implements BuildingHoveredSubscriber, BuildingUnhoveredSubscriber {
	private _viewModel: {
		hoveredNodePath: string[]
		hoveredNodeIsFile: boolean
	} = {
		hoveredNodePath: [],
		hoveredNodeIsFile: null
	}

	constructor(private $rootScope: IRootScopeService) {
		"ngInject"
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
	}

	onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		this._viewModel.hoveredNodePath = hoveredBuilding.node.path.slice(1).split("/")
		this._viewModel.hoveredNodeIsFile = hoveredBuilding.node.isLeaf
	}

	onBuildingUnhovered() {
		this._viewModel.hoveredNodePath = []
	}
}

export const nodePathPanelComponent = {
	selector: "nodePathPanelComponent",
	template: require("./nodePathPanel.component.html"),
	controller: NodePathPanelController
}
