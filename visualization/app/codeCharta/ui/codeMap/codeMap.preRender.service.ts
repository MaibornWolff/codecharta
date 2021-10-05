"use strict"

import { CodeMapNode, FileMeta } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { NodeDecorator } from "../../util/nodeDecorator"
import { AggregationGenerator } from "../../util/aggregationGenerator"
import { DeltaGenerator } from "../../util/deltaGenerator"
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
import { fileStatesAvailable, getVisibleFileStates, isDeltaState, isPartialState, isSingleState } from "../../model/files/files.helper"
import { FileSelectionState, FileState } from "../../model/files/files"
import { clone } from "../../util/clone"
import { PanelSelectionActions } from "../../state/store/appSettings/panelSelection/panelSelection.actions"
import { PresentationModeActions } from "../../state/store/appSettings/isPresentationMode/isPresentationMode.actions"
import { MetricDataService, MetricDataSubscriber } from "../../state/store/metricData/metricData.service"
import { NodeMetricDataService } from "../../state/store/metricData/nodeMetricData/nodeMetricData.service"
import { EdgeMetricDataService } from "../../state/store/metricData/edgeMetricData/edgeMetricData.service"
import { hierarchy } from "d3-hierarchy"
import { isLeaf } from "../../util/codeMapHelper"
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
	private readonly debounceDecorate: () => void
	private readonly debounceTracking: (actionType: string, payload?: unknown) => void
	private DEBOUNCE_TIME = 0

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private nodeMetricDataService: NodeMetricDataService,
		private codeMapRenderService: CodeMapRenderService,
		private edgeMetricDataService: EdgeMetricDataService
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

		this.debounceDecorate = debounce(() => {
			this.decorateIfPossible()
			if (this.allNecessaryRenderDataAvailable()) {
				this.renderAndNotify()
			}
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
			// We definitely need to improve this
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
		if (fileStatesAvailable(this.storeService.getState().files)) {
			this.updateRenderMapAndFileMeta()
			this.debounceDecorate()
		}
	}

	private updateRenderMapAndFileMeta() {
		const unifiedFile = this.getSelectedFilesAsUnifiedMap()
		this.unifiedMap = unifiedFile.map
		this.unifiedFileMeta = unifiedFile.fileMeta
	}

	private decorateIfPossible() {
		const { metricData, files, fileSettings } = this.storeService.getState()
		if (this.unifiedMap && this.unifiedFileMeta && fileStatesAvailable(files) && metricData.nodeMetricData) {
			NodeDecorator.decorateMap(this.unifiedMap, metricData, fileSettings.blacklist)
			this.getEdgeMetricsForLeaves(this.unifiedMap)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(this.unifiedMap, isDeltaState(files), fileSettings.attributeTypes)
		}
	}

	private getEdgeMetricsForLeaves(map: CodeMapNode) {
		const names = this.edgeMetricDataService.getMetricNames()
		if (names.length === 0) {
			return
		}
		for (const node of hierarchy(map)) {
			if (isLeaf(node)) {
				const edgeMetrics = this.edgeMetricDataService.getMetricValuesForNode(node, names)
				for (const [key, value] of edgeMetrics) {
					node.data.edgeAttributes[key] = value
				}
			}
		}
	}

	private getSelectedFilesAsUnifiedMap() {
		const { files } = this.storeService.getState()
		const visibleFileStates = clone(getVisibleFileStates(files))

		if (isSingleState(files)) {
			return visibleFileStates[0].file
		}
		if (isPartialState(files)) {
			return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))
		}
		if (isDeltaState(files)) {
			const [reference, comparison] = visibleFileStates
			if (comparison && reference.file.map.name !== comparison.file.map.name) {
				return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))
			}
			return this.getDeltaFile(visibleFileStates)
		}
	}

	private getDeltaFile(visibleFileStates: FileState[]) {
		if (visibleFileStates.length === 2) {
			let [reference, comparison] = visibleFileStates
			if (reference.selectedAs !== FileSelectionState.Reference) {
				const temporary = comparison
				comparison = reference
				reference = temporary
			}
			return DeltaGenerator.getDeltaFile(reference.file, comparison.file)
		}
		// Compare with itself. This is somewhat questionable.
		const [{ file }] = visibleFileStates
		return DeltaGenerator.getDeltaFile(file, file)
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
