import "./nodePathPanel.component.scss"
import { BuildingHoveredEventSubscriber, CodeMapMouseEventService, CodeMapBuildingTransition } from "../codeMap/codeMap.mouseEvent.service"
import { BlacklistItem } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"

export class NodePathPanelController implements BuildingHoveredEventSubscriber {
	private _viewModel: {
		hoveredNodePath: string
	} = {
		hoveredNodePath: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService) {
		CodeMapMouseEventService.subscribeToBuildingHoveredEvents(this.$rootScope, this)
		SettingsService.subscribeToBlacklist(this.$rootScope, this)
	}

	public onBuildingHovered(data: CodeMapBuildingTransition) {
		if (data.to && data.to.node) {
			this._viewModel.hoveredNodePath = data.to.node.path
		} else {
			this._viewModel.hoveredNodePath = null
		}
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
