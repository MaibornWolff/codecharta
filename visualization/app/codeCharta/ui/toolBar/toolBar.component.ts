import "./toolBar.component.scss"
import { CodeMapMouseEventService, BuildingUnhoveredSubscriber, BuildingHoveredSubscriber } from "../codeMap/codeMap.mouseEvent.service"
import { IRootScopeService } from "angular"
import {
	ExperimentalFeaturesEnabledService,
	ExperimentalFeaturesEnabledSubscriber
} from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"

export class ToolBarController implements BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, ExperimentalFeaturesEnabledSubscriber {
	private _viewModel: {
		isNodeHovered: boolean
		experimentalFeaturesEnabled: boolean
	} = {
		isNodeHovered: null,
		experimentalFeaturesEnabled: false
	}

	constructor(private $rootScope: IRootScopeService) {
		"ngInject"
		CodeMapMouseEventService.subscribeToBuildingHovered(this.$rootScope, this)
		CodeMapMouseEventService.subscribeToBuildingUnhovered(this.$rootScope, this)
		ExperimentalFeaturesEnabledService.subscribe(this.$rootScope, this)
	}

	onBuildingHovered() {
		this._viewModel.isNodeHovered = true
	}

	onBuildingUnhovered() {
		this._viewModel.isNodeHovered = false
	}

	onExperimentalFeaturesEnabledChanged(experimentalFeaturesEnabled: boolean) {
		this._viewModel.experimentalFeaturesEnabled = experimentalFeaturesEnabled
	}
}

export const toolBarComponent = {
	selector: "toolBarComponent",
	template: require("./toolBar.component.html"),
	controller: ToolBarController
}
