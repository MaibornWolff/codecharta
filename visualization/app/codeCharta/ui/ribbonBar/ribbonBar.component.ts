import "./ribbonBar.component.scss"
import { IRootScopeService } from "angular"
import { StoreService } from "../../state/store.service"
import { EdgeMetricData, PanelSelection } from "../../codeCharta.model"
import { setPanelSelection } from "../../state/store/appSettings/panelSelection/panelSelection.actions"
import { PanelSelectionService, PanelSelectionSubscriber } from "../../state/store/appSettings/panelSelection/panelSelection.service"
import { CodeChartaMouseEventService } from "../../codeCharta.mouseEvent.service"
import {
	ExperimentalFeaturesEnabledService,
	ExperimentalFeaturesEnabledSubscriber
} from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.service"
import { FileState } from "../../model/files/files"
import { isDeltaState } from "../../model/files/files.helper"
import { FilesService } from "../../state/store/files/files.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"

export class RibbonBarController implements PanelSelectionSubscriber, ExperimentalFeaturesEnabledSubscriber, EdgeMetricData {
	constructor(
		private storeService: StoreService,
		private $rootScope: IRootScopeService,
		private codeChartaMouseEventService: CodeChartaMouseEventService
	) {
		"ngInject"
		PanelSelectionService.subscribe(this.$rootScope, this)
		ExperimentalFeaturesEnabledService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
		EdgeMetricDataService.subscribe(this.$rootScope, this)
	}

	name: string
	maxValue: number
	minValue: number
	private _viewModel: {
		panelSelection: PanelSelection
		panelSelectionValues: typeof PanelSelection
		experimentalFeaturesEnabled: boolean
		isDeltaState: boolean
		hasEdgeMetric: boolean
		files: FileState[]
	} = {
		panelSelection: PanelSelection.NONE,
		panelSelectionValues: PanelSelection,
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

	onPanelSelectionChanged(panelSelection: PanelSelection) {
		this._viewModel.panelSelection = panelSelection
	}

	onExperimentalFeaturesEnabledChanged(experimentalFeaturesEnabled: boolean) {
		this._viewModel.experimentalFeaturesEnabled = experimentalFeaturesEnabled
	}

	onClick() {
		this.codeChartaMouseEventService.closeComponentsExceptCurrent()
	}

	toggle(panelSelection: PanelSelection) {
		;(document.activeElement as HTMLElement).blur()

		const newSelection = this._viewModel.panelSelection !== panelSelection ? panelSelection : PanelSelection.NONE
		this.storeService.dispatch(setPanelSelection(newSelection))

		this.codeChartaMouseEventService.closeComponentsExceptCurrent(this.codeChartaMouseEventService.closeRibbonBarSections)
	}
}

export const ribbonBarComponent = {
	selector: "ribbonBarComponent",
	template: require("./ribbonBar.component.html"),
	controller: RibbonBarController
}
