import { IRootScopeService } from "angular"
import "./legendPanel.component.scss"
import { ColorRange, EdgeMetricData } from "../../codeCharta.model"
import { ColorRangeService, ColorRangeSubscriber } from "../../state/store/dynamicSettings/colorRange/colorRange.service"
import {
	IsAttributeSideBarVisibleService,
	IsAttributeSideBarVisibleSubscriber
} from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.service"
import { EdgeMetricService, EdgeMetricSubscriber } from "../../state/store/dynamicSettings/edgeMetric/edgeMetric.service"
import { isDeltaState } from "../../model/files/files.helper"
import { ColorMetricService, ColorMetricSubscriber } from "../../state/store/dynamicSettings/colorMetric/colorMetric.service"
import { HeightMetricService, HeightMetricSubscriber } from "../../state/store/dynamicSettings/heightMetric/heightMetric.service"
import { AreaMetricService, AreaMetricSubscriber } from "../../state/store/dynamicSettings/areaMetric/areaMetric.service"
import { FilesSelectionSubscriber, FilesService } from "../../state/store/files/files.service"
import { FileState } from "../../model/files/files"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { StoreService } from "../../state/store.service"
import { BlacklistService } from "../../state/store/fileSettings/blacklist/blacklist.service"

export class LegendPanelController
	implements
		IsAttributeSideBarVisibleSubscriber,
		ColorMetricSubscriber,
		HeightMetricSubscriber,
		AreaMetricSubscriber,
		ColorRangeSubscriber,
		FilesSelectionSubscriber,
		EdgeMetricSubscriber
{
	private _viewModel: {
		isLegendVisible: boolean
		isSideBarVisible: boolean
		isDeltaState: boolean
		colorMetric: string
		heightMetric: string
		areaMetric: string
		colorRange: ColorRange
		edge: string
		edgeMetricData: EdgeMetricData[]
		edgeMetricHasEdge: boolean
		maxMetricValue: number
	} = {
		isLegendVisible: false,
		isSideBarVisible: null,
		isDeltaState: null,
		colorMetric: null,
		heightMetric: null,
		areaMetric: null,
		colorRange: null,
		edge: null,
		edgeMetricData: null,
		edgeMetricHasEdge: false,
		maxMetricValue: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private nodeMetricDataService: NodeMetricDataService,
		private storeService: StoreService
	) {
		"ngInject"
		ColorMetricService.subscribe(this.$rootScope, this)
		HeightMetricService.subscribe(this.$rootScope, this)
		AreaMetricService.subscribe(this.$rootScope, this)
		ColorRangeService.subscribe(this.$rootScope, this)
		EdgeMetricService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		IsAttributeSideBarVisibleService.subscribe(this.$rootScope, this)
		FilesService.subscribe(this.$rootScope, this)
	}

	onFilesSelectionChanged(files: FileState[]) {
		this._viewModel.isDeltaState = isDeltaState(files)
		this.updateMaxMetricValue()
	}

	onColorMetricChanged(colorMetric: string) {
		this._viewModel.colorMetric = colorMetric
		this.updateMaxMetricValue()
	}

	onHeightMetricChanged(heightMetric: string) {
		this._viewModel.heightMetric = heightMetric
	}

	onAreaMetricChanged(areaMetric: string) {
		this._viewModel.areaMetric = areaMetric
	}

	onEdgeMetricChanged(edgeMetric: string) {
		this._viewModel.edge = edgeMetric
		this._viewModel.edgeMetricData = this.storeService.getState().metricData.edgeMetricData
		const result = this._viewModel.edgeMetricData.find(object => {
			return object.name === this._viewModel.edge
		})
		if (result["maxValue"] > 0) {
			this._viewModel.edgeMetricHasEdge = true
		}
	}

	onColorRangeChanged(colorRange: ColorRange) {
		this._viewModel.colorRange = colorRange
	}

	onBlacklistChanged() {
		this.updateMaxMetricValue()
	}

	onIsAttributeSideBarVisibleChanged(isAttributeSideBarVisible: boolean) {
		this._viewModel.isSideBarVisible = isAttributeSideBarVisible
	}

	toggle() {
		this._viewModel.isLegendVisible = !this._viewModel.isLegendVisible
	}

	private updateMaxMetricValue() {
		this._viewModel.maxMetricValue = this.nodeMetricDataService.getMaxMetricByMetricName(
			this.storeService.getState().dynamicSettings.colorMetric
		)
	}
}

export const legendPanelComponent = {
	selector: "legendPanelComponent",
	template: require("./legendPanel.component.html"),
	controller: LegendPanelController
}
