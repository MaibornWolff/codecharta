import "./nodePathPanel.component.scss"
import { BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, CodeMapMouseEventService } from "../codeMap/codeMap.mouseEvent.service"
import { BlacklistItem } from "../../model/codeCharta.model"
import { IRootScopeService } from "angular"
import { CodeMapBuilding } from "../codeMap/rendering/codeMapBuilding"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"

export class NodePathPanelController implements BuildingHoveredSubscriber, BuildingUnhoveredSubscriber {
	private _viewModel: {
		hoveredNodePath: string[]
		hoveredNodeIsFile: boolean
	} = {
		hoveredNodePath: [],
		hoveredNodeIsFile: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService) {
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
	}

	public onBuildingHovered(hoveredBuilding: CodeMapBuilding) {
		if (hoveredBuilding.node) {
			this._viewModel.hoveredNodePath = hoveredBuilding.node.path.substr(1).split("/")
			this._viewModel.hoveredNodeIsFile = hoveredBuilding.node.isLeaf
		}
	}

	public onBuildingUnhovered() {
		this._viewModel.hoveredNodePath = null
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this._viewModel.hoveredNodePath = null
	}
}

export const nodePathPanelComponent = {
	selector: "nodePathPanelComponent",
	template: require("./nodePathPanel.component.html"),
	controller: NodePathPanelController
}
