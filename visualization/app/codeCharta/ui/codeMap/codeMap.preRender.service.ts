"use strict"

import { CodeMapNode, FileMeta } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { CodeMapRenderService } from "./codeMap.render.service"
import { StoreService, StoreSubscriber } from "../../state/store.service"
import debounce from "lodash.debounce"
import { ScalingActions } from "../../state/store/appSettings/scaling/scaling.actions"
import { IsLoadingMapActions, setIsLoadingMap } from "../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { IsLoadingFileActions, setIsLoadingFile } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { isActionOfType } from "../../util/reduxHelper"
import { SortingOrderAscendingActions } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { SortingOptionActions } from "../../state/store/dynamicSettings/sortingOption/sortingOption.actions"
import { IsAttributeSideBarVisibleActions } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { fileStatesAvailable } from "../../model/files/files.helper"
import { PresentationModeActions } from "../../state/store/appSettings/isPresentationMode/isPresentationMode.actions"
import { MetricDataService, MetricDataSubscriber } from "../../state/store/metricData/metricData.service"
import { ExperimentalFeaturesEnabledActions } from "../../state/store/appSettings/enableExperimentalFeatures/experimentalFeaturesEnabled.actions"
import { HoveredNodeIdActions } from "../../state/store/appStatus/hoveredNodeId/hoveredNodeId.actions"
import { accumulatedDataSelector } from "../../state/selectors/accumulatedData/accumulatedData.selector"
import { areAllNecessaryRenderDataAvailableSelector } from "../../state/selectors/allNecessaryRenderDataAvailable/areAllNecessaryRenderDataAvailable.selector"
import { RightClickedNodeDataActions } from "../../state/store/appStatus/rightClickedNodeData/rightClickedNodeData.actions"

export interface CodeMapPreRenderServiceSubscriber {
	onRenderMapChanged(map: CodeMapNode)
}

export class CodeMapPreRenderService implements StoreSubscriber, MetricDataSubscriber {
	private static RENDER_MAP_CHANGED_EVENT = "render-map-changed"

	private unifiedMap: CodeMapNode
	private unifiedFileMeta: FileMeta

	private readonly debounceRendering: () => void
	private DEBOUNCE_TIME = 0

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private codeMapRenderService: CodeMapRenderService
	) {
		"ngInject"
		MetricDataService.subscribe(this.$rootScope, this)
		StoreService.subscribe(this.$rootScope, this)

		this.debounceRendering = debounce(() => {
			this.renderAndNotify()
		}, this.DEBOUNCE_TIME)
	}

	onStoreChanged(actionType: string) {
		// TODO: Get rid of this if else block. Why do we sometimes call this.debounceRendering() and sometimes this.codeMapRenderService.update()?
		if (
			this.allNecessaryRenderDataAvailable() &&
			!isActionOfType(actionType, ScalingActions) &&
			!isActionOfType(actionType, IsLoadingMapActions) &&
			!isActionOfType(actionType, IsLoadingFileActions) &&
			!isActionOfType(actionType, SortingOrderAscendingActions) &&
			!isActionOfType(actionType, SortingOptionActions) &&
			!isActionOfType(actionType, IsAttributeSideBarVisibleActions) &&
			!isActionOfType(actionType, PresentationModeActions) &&
			!isActionOfType(actionType, ExperimentalFeaturesEnabledActions) &&
			!isActionOfType(actionType, HoveredNodeIdActions) &&
			!isActionOfType(actionType, RightClickedNodeDataActions)
		) {
			this.debounceRendering()
		} else {
			// this.codeMapRenderService.update()
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
		// this.codeMapRenderService.render(this.unifiedMap)
		this.removeLoadingGifs()
		this.notifyMapChanged()
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

	private notifyMapChanged() {
		this.$rootScope.$broadcast(CodeMapPreRenderService.RENDER_MAP_CHANGED_EVENT, this.unifiedMap)
	}

	static subscribe($rootScope: IRootScopeService, subscriber: CodeMapPreRenderServiceSubscriber) {
		$rootScope.$on(CodeMapPreRenderService.RENDER_MAP_CHANGED_EVENT, (_event, data) => {
			subscriber.onRenderMapChanged(data)
		})
	}
}
