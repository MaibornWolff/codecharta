import "./toolBar.component.scss"
import { CodeMapMouseEventService, BuildingUnhoveredSubscriber, BuildingHoveredSubscriber } from "../codeMap/codeMap.mouseEvent.service"
import { IRootScopeService } from "angular"
import { CodeChartaMouseEventService } from "../../codeCharta.mouseEvent.service"
import {
	ExperimentalFeaturesEnabledService,
	ExperimentalFeaturesEnabledSubscriber
} from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import {DialogService} from "../dialog/dialog.service";

export class ToolBarController implements BuildingHoveredSubscriber, BuildingUnhoveredSubscriber, ExperimentalFeaturesEnabledSubscriber {
	private _viewModel: {
		isNodeHovered: boolean
		experimentalFeaturesEnabled: boolean
	} = {
		isNodeHovered: null,
		experimentalFeaturesEnabled: false
	}

	constructor(private $rootScope: IRootScopeService, private codeChartaMouseEventService: CodeChartaMouseEventService,private dialogService: DialogService) {
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

	onClick() {
		this.codeChartaMouseEventService.closeComponentsExceptCurrent()
	}
	showAddCustomConfigSettings() {
		this.dialogService.showChangelogDialog()
	}
}

export const toolBarComponent = {
	selector: "toolBarComponent",
	template: require("./toolBar.component.html"),
	controller: ToolBarController
}
