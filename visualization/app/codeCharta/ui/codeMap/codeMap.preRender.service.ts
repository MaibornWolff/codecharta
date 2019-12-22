"use strict"

import { CCFile, FileSelectionState, FileState, MetricData, CodeMapNode, FileMeta } from "../../codeCharta.model"
import { IRootScopeService } from "angular"
import { FileStateService } from "../../state/fileState.service"
import { NodeDecorator } from "../../util/nodeDecorator"
import { AggregationGenerator } from "../../util/aggregationGenerator"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import { DeltaGenerator } from "../../util/deltaGenerator"
import { ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { CodeMapRenderService } from "./codeMap.render.service"
import { LoadingStatusService } from "../../state/loadingStatus.service"
import { EdgeMetricDataService } from "../../state/edgeMetricData.service"
import * as d3 from "d3"
import { StoreService, StoreSubscriber } from "../../state/store.service"
import { ScalingService, ScalingSubscriber } from "../../state/store/appSettings/scaling/scaling.service"
import _ from "lodash"
import { ScalingActions } from "../../state/store/appSettings/scaling/scaling.actions"

export interface CodeMapPreRenderServiceSubscriber {
	onRenderMapChanged(map: CodeMapNode)
}

export class CodeMapPreRenderService implements StoreSubscriber, MetricServiceSubscriber, ScalingSubscriber {
	private static RENDER_MAP_CHANGED_EVENT = "render-map-changed"

	private unifiedMap: CodeMapNode
	private unifiedFileMeta: FileMeta

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private fileStateService: FileStateService,
		private metricService: MetricService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private codeMapRenderService: CodeMapRenderService,
		private loadingStatusService: LoadingStatusService,
		private edgeMetricDataService: EdgeMetricDataService
	) {
		MetricService.subscribe(this.$rootScope, this)
		StoreService.subscribe(this.$rootScope, this)
		ScalingService.subscribe(this.$rootScope, this)
	}

	public getRenderMap(): CodeMapNode {
		return this.unifiedMap
	}

	public getRenderFileMeta(): FileMeta {
		return this.unifiedFileMeta
	}

	public onStoreChanged(actionType: string) {
		if (this.allNecessaryRenderDataAvailable() && !_.values(ScalingActions).includes(actionType)) {
			this.renderAndNotify()
		}
	}

	public onScalingChanged(scaling) {
		if (this.allNecessaryRenderDataAvailable()) {
			this.scaleMapAndNotify()
		}
	}

	public onMetricDataAdded(metricData: MetricData[]) {
		if (this.fileStateService.getFileStates().length > 0) {
			this.updateRenderMapAndFileMeta()
			this.decorateIfPossible()
			if (this.allNecessaryRenderDataAvailable()) {
				this.renderAndNotify()
			}
		}
	}

	public onMetricDataRemoved() {}

	private updateRenderMapAndFileMeta() {
		const unifiedFile: CCFile = this.getSelectedFilesAsUnifiedMap()
		this.unifiedMap = unifiedFile.map
		this.unifiedFileMeta = unifiedFile.fileMeta
	}

	private decorateIfPossible() {
		if (this.unifiedMap && this.fileStateService.getFileStates() && this.unifiedFileMeta && this.metricService.getMetricData()) {
			this.unifiedMap = NodeDecorator.decorateMap(this.unifiedMap, this.unifiedFileMeta, this.metricService.getMetricData())
			this.getEdgeMetricsForLeaves(this.unifiedMap)
			NodeDecorator.decorateParentNodesWithSumAttributes(
				this.unifiedMap,
				this.storeService.getState().fileSettings.blacklist,
				this.metricService.getMetricData(),
				this.edgeMetricDataService.getMetricData(),
				FileStateHelper.isDeltaState(this.fileStateService.getFileStates())
			)
		}
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
		const fileStates: FileState[] = this.fileStateService.getFileStates()
		let visibleFileStates: FileState[] = FileStateHelper.getVisibleFileStates(fileStates)
		visibleFileStates.forEach(fileState => {
			fileState.file = NodeDecorator.preDecorateFile(fileState.file)
		})

		if (FileStateHelper.isSingleState(fileStates)) {
			return visibleFileStates[0].file
		} else if (FileStateHelper.isPartialState(fileStates)) {
			return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))
		} else if (FileStateHelper.isDeltaState(fileStates)) {
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

		this.notifyLoadingMapStatus()
		this.notifyMapChanged()
		if (this.loadingStatusService.isLoadingNewFile()) {
			this.notifyLoadingFileStatus()
			this.threeOrbitControlsService.cameraActionWhenNewMapIsLoaded()
		}
	}

	private scaleMapAndNotify() {
		this.codeMapRenderService.scaleMap()
		this.notifyLoadingMapStatus()
	}

	private allNecessaryRenderDataAvailable(): boolean {
		return (
			this.fileStateService.getFileStates().length > 0 &&
			this.metricService.getMetricData() !== null &&
			this.metricService.getMetricData().length > 1 &&
			_.values(this.storeService.getState().dynamicSettings).every(x => {
				return x !== null && _.values(x).every(x => x !== null)
			})
		)
	}

	private notifyLoadingFileStatus() {
		this.loadingStatusService.updateLoadingFileFlag(false)
	}

	private notifyLoadingMapStatus() {
		this.loadingStatusService.updateLoadingMapFlag(false)
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
