import "./ribbonBar.component.scss"
import { IRootScopeService } from "angular"
import { EdgeMetricData } from "../../codeCharta.model"
import {
	ExperimentalFeaturesEnabledService,
	ExperimentalFeaturesEnabledSubscriber
} from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { FileState } from "../../model/files/files"
import { isDeltaState } from "../../model/files/files.helper"
import { FilesService } from "../../state/store/files/files.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"

type PanelSelection = "NONE" | "AREA_PANEL_OPEN" | "HEIGHT_PANEL_OPEN" | "COLOR_PANEL_OPEN" | "EDGE_PANEL_OPEN"

export class RibbonBarController implements ExperimentalFeaturesEnabledSubscriber {
	constructor(private $rootScope: IRootScopeService) {
		"ngInject"
		ExperimentalFeaturesEnabledService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		EdgeMetricDataService.subscribe(this.$rootScope, this)
		document.addEventListener("mousedown", this.closePanelSelectionOnOutsideClick)
	}

	private _viewModel: {
		panelSelection: PanelSelection
		experimentalFeaturesEnabled: boolean
		isDeltaState: boolean
		hasEdgeMetric: boolean
		files: FileState[]
	} = {
		panelSelection: "NONE",
		experimentalFeaturesEnabled: false,
		isDeltaState: null,
		hasEdgeMetric: false,
		files: null
	}

	onEdgeMetricDataChanged(edgeMetricData: EdgeMetricData[]) {
		this._viewModel.hasEdgeMetric = edgeMetricData.length > 0
	}

	onFilesSelectionChanged(files: FileState[]) {
		this._viewModel.files = files
		this._viewModel.isDeltaState = isDeltaState(files)
	}

	onExperimentalFeaturesEnabledChanged(experimentalFeaturesEnabled: boolean) {
		this._viewModel.experimentalFeaturesEnabled = experimentalFeaturesEnabled
	}

	updatePanelSelection(panelSelection: PanelSelection) {
		this._viewModel.panelSelection = this._viewModel.panelSelection === panelSelection ? "NONE" : panelSelection
	}

	private closePanelSelectionOnOutsideClick = (event: MouseEvent) => {
		if (this._viewModel.panelSelection !== "NONE" && this.isOutside(event)) {
			this._viewModel.panelSelection = "NONE"
		}
	}

	private panelSelectionComponents = [
		"CC-AREA-SETTINGS-PANEL",
		"CC-HEIGHT-SETTINGS-PANEL",
		"CC-COLOR-SETTINGS-PANEL",
		"CC-EDGE-SETTINGS-PANEL",
		"COLOR-CHROME"
	]
	private panelSectionTogglerTitles = [
		"Show area metric settings",
		"Show height metric settings",
		"Show color metric settings",
		"Show edge metric settings"
	]
	private isOutside(event: MouseEvent) {
		return event
			.composedPath()
			.every(
				element =>
					!this.panelSelectionComponents.includes(element["nodeName"]) &&
					!this.panelSectionTogglerTitles.includes(element["title"]) &&
					element["id"] !== "codemap-context-menu"
			)
	}
}

export const ribbonBarComponent = {
	selector: "ribbonBarComponent",
	template: require("./ribbonBar.component.html"),
	controller: RibbonBarController
}
