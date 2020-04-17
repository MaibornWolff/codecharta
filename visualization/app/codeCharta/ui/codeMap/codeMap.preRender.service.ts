"use strict"

import {
	CCFile,
	FileSelectionState,
	FileState,
	MetricData,
	CodeMapNode,
	FileMeta,
	BlacklistType,
	BlacklistItem
} from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { NodeDecorator } from "../../util/nodeDecorator"
import { AggregationGenerator } from "../../util/aggregationGenerator"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { DeltaGenerator } from "../../util/deltaGenerator"
import { CodeMapRenderService } from "./codeMap.render.service"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import * as d3 from "d3"
import { StoreService, StoreSubscriber } from "../../state/store.service"
import { ScalingService, ScalingSubscriber } from "../../state/store/appSettings/scaling/scaling.service"
import _ from "lodash"
import { ScalingActions } from "../../state/store/appSettings/scaling/scaling.actions"
import { IsLoadingMapActions, setIsLoadingMap } from "../../state/store/appSettings/isLoadingMap/isLoadingMap.actions"
import { IsLoadingFileActions, setIsLoadingFile } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.actions"
import { SearchPanelModeActions } from "../../state/store/appSettings/searchPanelMode/searchPanelMode.actions"
import { isActionOfType } from "../../util/reduxHelper"
import { SortingOrderAscendingActions } from "../../state/store/appSettings/sortingOrderAscending/sortingOrderAscending.actions"
import { SortingOptionActions } from "../../state/store/dynamicSettings/sortingOption/sortingOption.actions"
import ignore from "ignore"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { hierarchy } from "d3"
import { TreeMapGenerator } from "../../util/treeMapGenerator"
import { IsAttributeSideBarVisibleActions } from "../../state/store/appSettings/isAttributeSideBarVisible/isAttributeSideBarVisible.actions"
import { BlacklistService, BlacklistSubscriber } from "../../state/store/fileSettings/blacklist/blacklist.service"
import {
	FocusedNodePathService,
	FocusNodeSubscriber,
	UnfocusNodeSubscriber
} from "../../state/store/dynamicSettings/focusedNodePath/focusedNodePath.service"

const clone = require("rfdc")()

export interface CodeMapPreRenderServiceSubscriber {
	onRenderMapChanged(map: CodeMapNode)
}

export class CodeMapPreRenderService
	implements
		StoreSubscriber,
		MetricServiceSubscriber,
		ScalingSubscriber,
		BlacklistSubscriber,
		FocusNodeSubscriber,
		UnfocusNodeSubscriber {
	private static RENDER_MAP_CHANGED_EVENT = "render-map-changed"

	private unifiedMap: CodeMapNode
	private unifiedFileMeta: FileMeta

	private readonly debounceRendering: () => void
	private DEBOUNCE_TIME = 0

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private metricService: MetricService,
		private codeMapRenderService: CodeMapRenderService,
		private edgeMetricDataService: EdgeMetricDataService
	) {
		MetricService.subscribe(this.$rootScope, this)
		StoreService.subscribe(this.$rootScope, this)
		ScalingService.subscribe(this.$rootScope, this)
		BlacklistService.subscribe(this.$rootScope, this)
		FocusedNodePathService.subscribeToFocusNode(this.$rootScope, this)
		FocusedNodePathService.subscribeToUnfocusNode(this.$rootScope, this)
		this.debounceRendering = _.debounce(() => {
			this.renderAndNotify()
		}, this.DEBOUNCE_TIME)
	}

	public getRenderMap(): CodeMapNode {
		return this.unifiedMap
	}

	public getRenderFileMeta(): FileMeta {
		return this.unifiedFileMeta
	}

	public onStoreChanged(actionType: string) {
		if (
			this.allNecessaryRenderDataAvailable() &&
			!isActionOfType(actionType, ScalingActions) &&
			!isActionOfType(actionType, IsLoadingMapActions) &&
			!isActionOfType(actionType, IsLoadingFileActions) &&
			!isActionOfType(actionType, SearchPanelModeActions) &&
			!isActionOfType(actionType, SortingOrderAscendingActions) &&
			!isActionOfType(actionType, SortingOptionActions) &&
			!isActionOfType(actionType, IsAttributeSideBarVisibleActions)
		) {
			this.debounceRendering()
		}
	}

	public onScalingChanged(scaling) {
		if (this.allNecessaryRenderDataAvailable()) {
			this.scaleMapAndNotify()
		}
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		if (this.storeService.getState().files.fileStatesAvailable()) {
			this.updateRenderMapAndFileMeta()
			this.decorateIfPossible()
			if (this.allNecessaryRenderDataAvailable()) {
				this.debounceRendering()
			}
		}
	}

	public onBlacklistChanged(blacklist: BlacklistItem[]) {
		this.updateIsBlacklisted()
	}

	public onFocusNode(focusedNodePath: string) {
		const focusedNode = CodeMapHelper.getAnyCodeMapNodeFromPath(
			this.storeService.getState().dynamicSettings.focusedNodePath,
			this.unifiedMap
		)
		TreeMapGenerator.setVisibilityOfNodeAndDescendants(this.unifiedMap, false)
		TreeMapGenerator.setVisibilityOfNodeAndDescendants(focusedNode, true)
	}

	public onUnfocusNode() {
		TreeMapGenerator.setVisibilityOfNodeAndDescendants(this.unifiedMap, true)
	}

	private updateRenderMapAndFileMeta() {
		const unifiedFile = this.getSelectedFilesAsUnifiedMap()
		this.unifiedMap = unifiedFile.map
		this.unifiedFileMeta = unifiedFile.fileMeta
	}

	private decorateIfPossible() {
		const state = this.storeService.getState()
		if (this.unifiedMap && state.files.fileStatesAvailable() && this.unifiedFileMeta && this.metricService.getMetricData()) {
			NodeDecorator.decorateMap(this.unifiedMap, this.metricService.getMetricData())
			this.getEdgeMetricsForLeaves(this.unifiedMap)
			NodeDecorator.decorateParentNodesWithAggregatedAttributes(
				this.unifiedMap,
				state.fileSettings.blacklist,
				this.metricService.getMetricData(),
				this.edgeMetricDataService.getMetricData(),
				state.files.isDeltaState(),
				state.fileSettings.attributeTypes
			)
		}
	}

	private updateIsBlacklisted() {
		const blacklist = this.storeService.getState().fileSettings.blacklist
		const map = this.getRenderMap()
		const flattened = ignore()
		const excluded = ignore()

		for (let item of blacklist) {
			const path = CodeMapHelper.transformPath(item.path)
			item.type === BlacklistType.flatten ? flattened.add(path) : excluded.add(path)
		}

		hierarchy(map)
			.leaves()
			.map(node => {
				const path = CodeMapHelper.transformPath(node.data.path)
				node.data.isFlattened = flattened.ignores(path)
				node.data.isExcluded = excluded.ignores(path)
			})
	}

	private getEdgeMetricsForLeaves(map: CodeMapNode) {
		if (map && this.edgeMetricDataService.getMetricNames()) {
			let root = d3.hierarchy<CodeMapNode>(map)
			root.leaves().forEach(node => {
				const edgeMetrics = this.edgeMetricDataService.getMetricValuesForNode(node)
				for (let edgeMetric of edgeMetrics.keys()) {
					Object.assign(node.data.edgeAttributes, { [edgeMetric]: edgeMetrics.get(edgeMetric) })
				}
			})
		}
	}

	private getSelectedFilesAsUnifiedMap(): CCFile {
		const files = this.storeService.getState().files
		const visibleFileStates = clone(files.getVisibleFileStates())

		if (files.isSingleState()) {
			return visibleFileStates[0].file
		} else if (files.isPartialState()) {
			return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))
		} else if (files.isDeltaState()) {
			return this.getDeltaFile(visibleFileStates)
		}
	}

	private getDeltaFile(visibleFileStates: FileState[]): CCFile {
		if (visibleFileStates.length == 2) {
			const referenceFile = visibleFileStates.find(x => x.selectedAs == FileSelectionState.Reference).file
			const comparisonFile = visibleFileStates.find(x => x.selectedAs == FileSelectionState.Comparison).file
			return DeltaGenerator.getDeltaFile(referenceFile, comparisonFile)
		} else {
			const referenceFile = visibleFileStates[0].file
			const comparisonFile = visibleFileStates[0].file
			return DeltaGenerator.getDeltaFile(referenceFile, comparisonFile)
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

	private allNecessaryRenderDataAvailable(): boolean {
		return (
			this.storeService.getState().files.fileStatesAvailable() &&
			this.metricService.getMetricData() !== null &&
			this.areChosenMetricsInMetricData() &&
			_.values(this.storeService.getState().dynamicSettings).every(x => {
				return x !== null && _.values(x).every(x => x !== null)
			})
		)
	}

	private areChosenMetricsInMetricData() {
		const dynamicSettings = this.storeService.getState().dynamicSettings
		return (
			this.metricService.isMetricAvailable(dynamicSettings.areaMetric) &&
			this.metricService.isMetricAvailable(dynamicSettings.colorMetric) &&
			this.metricService.isMetricAvailable(dynamicSettings.heightMetric)
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

	public static subscribe($rootScope: IRootScopeService, subscriber: CodeMapPreRenderServiceSubscriber) {
		$rootScope.$on(CodeMapPreRenderService.RENDER_MAP_CHANGED_EVENT, (event, data) => {
			subscriber.onRenderMapChanged(data)
		})
	}
}
