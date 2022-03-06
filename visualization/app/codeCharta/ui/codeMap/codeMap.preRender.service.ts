"use strict"

import { CodeMapNode, FileMeta } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { CodeMapRenderService } from "./codeMap.render.service"
import { StoreService, StoreSubscriber } from "../../state/store.service"
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
import { ExperimentalFeaturesEnabledActions } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { LayoutAlgorithmService, LayoutAlgorithmSubscriber } from "../../state/store/appSettings/layoutAlgorithm/layoutAlgorithm.service"
import { trackMapMetaData } from "../../util/usageDataTracker"
import { HoveredBuildingPathActions } from "../../state/store/appStatus/hoveredBuildingPath/hoveredBuildingPath.actions"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { areAllNecessaryRenderDataAvailableSelector } from "../../state/selectors/allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector"
import { RightClickedNodeDataActions } from "../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"

export interface CodeMapPreRenderServiceSubscriber {
	onRenderMapChanged(map: CodeMapNode)
}

export class CodeMapPreRenderService implements StoreSubscriber, MetricDataSubscriber, ScalingSubscriber, LayoutAlgorithmSubscriber {
	private static RENDER_MAP_CHANGED_EVENT = "render-map-changed"

	private unifiedMap: CodeMapNode
	private unifiedFileMeta: FileMeta

	private readonly debounceRendering: () => void
	private readonly debounceTracking: (actionType: string, payload?: unknown) => void
	private DEBOUNCE_TIME = 0

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapRenderService: CodeMapRenderService
	) {
		"ngInject"
		MetricDataService.subscribe(this.$rootScope, this)
		StoreService.subscribe(this.$rootScope, this)
		ScalingService.subscribe(this.$rootScope, this)
		LayoutAlgorithmService.subscribe(this.$rootScope, this)

		this.debounceRendering = debounce(() => {
			this.renderAndNotify()
		}, this.DEBOUNCE_TIME)

		this.debounceTracking = debounce(() => {
			trackMapMetaData(this.storeService.getState().files)
		}, 1000)
	}

	getRenderMap() {
		return this.unifiedMap
	}

	getRenderFileMeta() {
		return this.unifiedFileMeta
	}

	onStoreChanged(actionType: string) {
		// TODO: Get rid of this if else block. Why do we sometimes call this.debounceRendering() and sometimes this.codeMapRenderService.update()?
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
			!isActionOfType(actionType, HoveredBuildingPathActions) &&
			!isActionOfType(actionType, RightClickedNodeDataActions)
		) {
			this.debounceRendering()
			this.debounceTracking(actionType)
		} else {
			this.codeMapRenderService.update()
		}
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
		return areAllNecessaryRenderDataAvailableSelector(this.storeService.getState())
	}

	private removeLoadingGifs() {
		if (this.storeService.getState().appSettings.isLoadingFile) {
			this.storeService.dispatch(setIsLoadingFile(false))
		}
		if (this.storeService.getState().appSettings.isLoadingMap) {
			this.storeService.dispatch(setIsLoadingMap(false))
		}
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
