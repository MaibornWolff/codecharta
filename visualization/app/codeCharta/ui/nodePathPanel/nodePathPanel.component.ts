import "./nodePathPanel.component.scss"
import { BuildingHoveredEventSubscriber, CodeMapMouseEventService, CodeMapBuildingTransition } from "../codeMap/codeMap.mouseEvent.service"
import { BlacklistItem } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { SettingsService } from "../../state/settingsService/settings.service"

export class NodePathPanelController implements BuildingHoveredEventSubscriber {
	private _viewModel: {
		hoveredNodePath: string[]
		hoveredNodeName: string
	} = {
		hoveredNodePath: [],
		hoveredNodeName: null
	}

	/* @ngInject */
	constructor(private $rootScope: IRootScopeService) {
		CodeMapMouseEventService.subscribeToBuildingHoveredEvents(this.$rootScope, this)
		SettingsService.subscribeToBlacklist(this.$rootScope, this)
	}

	public onBuildingHovered(data: CodeMapBuildingTransition) {
		if (data.to && data.to.node) {
			this.updatePathAndName(data.to.node.path)
		}
	}

	private updatePathAndName(path: string) {
		const pathComponents = path.substr(1).split("/")
		this._viewModel.hoveredNodeName = pathComponents.pop()
		this._viewModel.hoveredNodePath = pathComponents
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
