"use strict"

import { CodeMapNode, FileMeta } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { CodeMapRenderService } from "./codeMap.render.service"
import { StoreExtendedSubscriber, StoreService, StoreSubscriber } from "../../state/store.service"
import { ScalingService, ScalingSubscriber } from "../../state/store/appSettings/scaling/scaling.service"
import debounce from "lodash.debounce"
import { ScalingActions } from "../../state/store/appSettings/scaling/scaling.actions"
import { IsLoadingMapActions, setIsLoadingMap } from "../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { IsLoadingFileActions, setIsLoadingFile } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { SearchPanelModeActions } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.actions"
import { isActionOfType } from "../../util/reduxHelper"
import { SortingOrderAscendingActions } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { SortingOptionActions } from "../../state/store/dynamicSettings/sortingOption/sortingOption.actions"
import { IsAttributeSideBarVisibleActions } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { fileStatesAvailable } from "../../model/files/files.helper"
import { PanelSelectionActions } from "../../state/store/appSettings/panelSelection/panelSelection.actions"
import { PresentationModeActions } from "../../state/store/appSettings/isPresentationMode/isPresentationMode.actions"
import { MetricDataService, MetricDataSubscriber } from "../../state/store/metricData/metricData.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { ExperimentalFeaturesEnabledActions } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { LayoutAlgorithmService, LayoutAlgorithmSubscriber } from "../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.service"
import { trackEventUsageData, trackMapMetaData } from "../../util/usageDataTracker"
import { AreaMetricActions } from "../../state/store/dynamicSettings/areaMetric/areaMetric.actions"
import { HeightMetricActions } from "../../state/store/dynamicSettings/heightMetric/heightMetric.actions"
import { ColorMetricActions } from "../../state/store/dynamicSettings/colorMetric/colorMetric.actions"
import { ColorRangeActions } from "../../state/store/dynamicSettings/colorRange/colorRange.actions"
import { BlacklistActions } from "../../state/store/fileSettings/blacklist/blacklist.actions"
import { FocusedNodePathActions } from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.actions"
import { SecondaryMetricsActions } from "../../state/store/appSettings/secondaryMetrics/secondaryMetrics.actions"
import { ColorRangeFromSubscriber, ColorRangeToSubscriber, RangeSliderController } from "../rangeSlider/rangeSlider.component"
import { HoveredBuildingPathActions } from "../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.actions"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"

export interface CodeMapPreRenderServiceSubscriber {
	onRenderMapChanged(map: CodeMapNode)
}

export class CodeMapPreRenderService
	implements
		StoreSubscriber,
		StoreExtendedSubscriber,
		MetricDataSubscriber,
		ScalingSubscriber,
		LayoutAlgorithmSubscriber,
		ColorRangeFromSubscriber,
		ColorRangeToSubscriber
{
	private static RENDER_MAP_CHANGED_EVENT = "render-map-changed"

	private unifiedMap: CodeMapNode
	private unifiedFileMeta: FileMeta

	private readonly debounceRendering: () => void
	private readonly debounceTracking: (actionType: string, payload?: unknown) => void
	private DEBOUNCE_TIME = 0

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private nodeMetricDataService: NodeMetricDataService,
		private codeMapRenderService: CodeMapRenderService
	) {
		"ngInject"
		MetricDataService.subscribe(this.$rootScope, this)
		StoreService.subscribe(this.$rootScope, this)
		StoreService.subscribeDetailedData(this.$rootScope, this)
		ScalingService.subscribe(this.$rootScope, this)
		LayoutAlgorithmService.subscribe(this.$rootScope, this)
		RangeSliderController.subscribeToColorRangeFromUpdated(this.$rootScope, this)
		RangeSliderController.subscribeToColorRangeToUpdated(this.$rootScope, this)

		this.debounceRendering = debounce(() => {
			this.renderAndNotify()
		}, this.DEBOUNCE_TIME)

		this.debounceTracking = debounce(() => {
			trackMapMetaData(this.storeService.getState())
		}, 1000)
	}

	getRenderMap() {
		return this.unifiedMap
	}

	getRenderFileMeta() {
		return this.unifiedFileMeta
	}

	onStoreChanged(actionType: string) {
		if (isActionOfType(actionType, HoveredBuildingPathActions)) {
			// temporary hack:
			// this.debounceRendering() leads to a new MapMesh, which leads to a new render, which would revert hover
			// TODO We definitely need to improve this
			return
		}

		if (
			this.allNecessaryRenderDataAvailable() &&
			!isActionOfType(actionType, ScalingActions) &&
			!isActionOfType(actionType, IsLoadingMapActions) &&
			!isActionOfType(actionType, IsLoadingFileActions) &&
			!isActionOfType(actionType, SearchPanelModeActions) &&
			!isActionOfType(actionType, SortingOrderAscendingActions) &&
			!isActionOfType(actionType, SortingOptionActions) &&
			!isActionOfType(actionType, IsAttributeSideBarVisibleActions) &&
			!isActionOfType(actionType, PanelSelectionActions) &&
			!isActionOfType(actionType, PresentationModeActions) &&
			!isActionOfType(actionType, ExperimentalFeaturesEnabledActions) &&
			!isActionOfType(actionType, SecondaryMetricsActions)
		) {
			this.debounceRendering()
			this.debounceTracking(actionType)
		} else {
			this.codeMapRenderService.update()
		}
	}

	onStoreChangedExtended(actionType: string, payload?: any) {
		if (
			this.allNecessaryRenderDataAvailable() &&
			(isActionOfType(actionType, AreaMetricActions) ||
				isActionOfType(actionType, HeightMetricActions) ||
				isActionOfType(actionType, ColorMetricActions) ||
				isActionOfType(actionType, ColorRangeActions) ||
				isActionOfType(actionType, BlacklistActions) ||
				isActionOfType(actionType, FocusedNodePathActions))
		) {
			// Track event usage data only on certain events
			trackEventUsageData(actionType, this.storeService.getState(), payload)
		}
	}

	onColorRangeFromUpdated(colorMetric: string, fromValue: number) {
		trackEventUsageData(RangeSliderController.COLOR_RANGE_FROM_UPDATED, this.storeService.getState(), { colorMetric, fromValue })
	}

	onColorRangeToUpdated(colorMetric: string, toValue: number) {
		trackEventUsageData(RangeSliderController.COLOR_RANGE_TO_UPDATED, this.storeService.getState(), { colorMetric, toValue })
	}

	onLayoutAlgorithmChanged() {
		this.debounceRendering()
	}

	onScalingChanged() {
		if (this.allNecessaryRenderDataAvailable()) {
			this.scaleMapAndNotify()
		}
	}

	onMetricDataChanged() {
		const state = this.storeService.getState()
		if (fileStatesAvailable(state.files)) {
			const data = accumulatedDataSelector(state)
			this.unifiedMap = data.unifiedMapNode
			this.unifiedFileMeta = data.unifiedFileMeta
		}

		if (this.allNecessaryRenderDataAvailable()) {
			this.debounceRendering()
		}
	}

	private renderAndNotify() {
		this.codeMapRenderService.render(this.unifiedMap)
		this.removeLoadingGifs()
		this.notifyMapChanged()
	}

	private scaleMapAndNotify() {
		this.showLoadingMapGif()
		this.codeMapRenderService.scaleMap()
		this.removeLoadingGifs()
	}

	private allNecessaryRenderDataAvailable() {
		return (
			this.storeService.getState().metricData.nodeMetricData !== null &&
			fileStatesAvailable(this.storeService.getState().files) &&
			this.areChosenMetricsInMetricData() &&
			Object.values(this.storeService.getState().dynamicSettings).every(x => {
				return x !== null && Object.values(x).every(v => v !== null)
			})
		)
	}

	private areChosenMetricsInMetricData() {
		const { dynamicSettings } = this.storeService.getState()
		return (
			this.nodeMetricDataService.isMetricAvailable(dynamicSettings.areaMetric) &&
			this.nodeMetricDataService.isMetricAvailable(dynamicSettings.colorMetric) &&
			this.nodeMetricDataService.isMetricAvailable(dynamicSettings.heightMetric)
		)
	}

	private removeLoadingGifs() {
		if (this.storeService.getState().appSettings.isLoadingFile) {
			this.storeService.dispatch(setIsLoadingFile(false))
		}
		this.storeService.dispatch(setIsLoadingMap(false))
	}

	private showLoadingMapGif() {
		this.storeService.dispatch(setIsLoadingMap(true))
	}

	private notifyMapChanged() {
		this.$rootScope.$broadcast(CodeMapPreRenderService.RENDER_MAP_CHANGED_EVENT, this.unifiedMap)
	}

	static subscribe($rootScope: IRootScopeService, subscriber: CodeMapPreRenderServiceSubscriber) {
		$rootScope.$on(CodeMapPreRenderService.RENDER_MAP_CHANGED_EVENT, (_event, data) => {
			subscriber.onRenderMapChanged(data)
		})
	}
}
