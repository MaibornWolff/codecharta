"use strict"

import {
	CCFile,
	FileSelectionState,
	FileState,
	MetricData,
	RecursivePartial,
	Settings,
	CodeMapNode,
	FileMeta
} from "../../codeCharta.model"
import { SettingsService } from "../../state/settingsService/settings.service"
import { IRootScopeService } from "angular"
import { FileStateService, FileStateServiceSubscriber } from "../../state/fileState.service"
import _ from "lodash"
import { NodeDecorator } from "../../util/nodeDecorator"
import { AggregationGenerator } from "../../util/aggregationGenerator"
import { MetricService, MetricServiceSubscriber } from "../../state/metric.service"
import { FileStateHelper } from "../../util/fileStateHelper"
import { DeltaGenerator } from "../../util/deltaGenerator"
import { ThreeOrbitControlsService } from "./threeViewer/threeOrbitControlsService"
import { CodeMapRenderService } from "./codeMap.render.service"
import { LoadingGifService } from "../loadingGif/loadingGif.service"
import { SettingsServiceSubscriber } from "../../state/settingsService/settings.service.events"
import { EdgeMetricService } from "../../state/edgeMetric.service"
import * as d3 from "d3"
import { ThreeCameraService } from "./threeViewer/threeCameraService"

export interface RenderData {
	map: CodeMapNode
	fileMeta: FileMeta
	fileStates: FileState[]
	settings: Settings
	metricData: MetricData[]
}

export interface CodeMapPreRenderServiceSubscriber {
	onRenderMapChanged(map: CodeMapNode)
}

export class CodeMapPreRenderService implements SettingsServiceSubscriber, FileStateServiceSubscriber, MetricServiceSubscriber {
	private static RENDER_MAP_CHANGED_EVENT = "render-map-changed"

	private newFileLoaded: boolean = false

	private lastRender: RenderData = {
		map: null,
		fileMeta: null,
		fileStates: null,
		settings: null,
		metricData: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private threeCameraService: ThreeCameraService,
		private codeMapRenderService: CodeMapRenderService,
		private loadingGifService: LoadingGifService,
		private edgeMetricService: EdgeMetricService
	) {
		FileStateService.subscribe(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
		SettingsService.subscribe(this.$rootScope, this)
	}

	public getRenderMap(): CodeMapNode {
		return this.lastRender.map
	}

	public getRenderFileMeta(): FileMeta {
		return this.lastRender.fileMeta
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>) {
		this.lastRender.settings = settings

		if (this.lastRender.fileStates && update.fileSettings && (update.fileSettings.blacklist || update.fileSettings.markedPackages)) {
			this.updateRenderMapAndFileMeta()
			this.decorateIfPossible()
		}

		if (this.allNecessaryRenderDataAvailable()) {
			if (this.settingsOnlyContainNewScaling(update)) {
				this.scaleMapAndNotify()
			} else {
				this.renderAndNotify()
			}
		}
	}

	public onFileSelectionStatesChanged(fileStates: FileState[]) {
		this.lastRender.fileStates = fileStates
		this.newFileLoaded = true
		this.updateRenderMapAndFileMeta()
	}

	public onImportedFilesChanged(fileStates: FileState[]) {}

	public onMetricDataAdded(metricData: MetricData[]) {
		this.lastRender.metricData = metricData
		this.decorateIfPossible()
		if (this.allNecessaryRenderDataAvailable()) {
			this.renderAndNotify()
		}
	}

	public onMetricDataRemoved() {
		this.lastRender.metricData = null
	}

	private updateRenderMapAndFileMeta() {
		const unifiedFile: CCFile = this.getSelectedFilesAsUnifiedMap(this.lastRender.fileStates)
		this.lastRender.map = unifiedFile.map
		this.lastRender.fileMeta = unifiedFile.fileMeta
	}

	private decorateIfPossible() {
		if (
			this.lastRender.map &&
			this.lastRender.fileMeta &&
			this.lastRender.settings &&
			this.lastRender.settings.fileSettings &&
			this.lastRender.settings.fileSettings.blacklist &&
			this.lastRender.metricData
		) {
			this.lastRender.map = NodeDecorator.decorateMap(this.lastRender.map, this.lastRender.fileMeta, this.lastRender.metricData)
			this.getEdgeMetricsForLeaves(this.lastRender.map)
			NodeDecorator.decorateParentNodesWithSumAttributes(
				this.lastRender.map,
				this.lastRender.settings.fileSettings.blacklist,
				this.lastRender.metricData,
				this.edgeMetricService.getMetricData()
			)
		}
	}

	private getEdgeMetricsForLeaves(map: CodeMapNode) {
		if (map && this.edgeMetricService.getMetricNames()) {
			let root = d3.hierarchy<CodeMapNode>(map)
			root.leaves().forEach(node => {
				const edgeMetrics = this.edgeMetricService.getMetricValuesForNode(node)
				for (let edgeMetric of edgeMetrics.keys()) {
					Object.assign(node.data.edgeAttributes, { [edgeMetric]: edgeMetrics.get(edgeMetric) })
				}
			})
		}
	}

	private getSelectedFilesAsUnifiedMap(fileStates: FileState[]): CCFile {
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

	private settingsOnlyContainNewScaling(update: RecursivePartial<Settings>): boolean {
		return _.keys(update).length == 1 && update.appSettings && _.keys(update.appSettings).length == 1 && !!update.appSettings.scaling
	}

	private renderAndNotify() {
		this.codeMapRenderService.render(this.lastRender)

		this.notifyLoadingMapStatus()
		this.notifyMapChanged()
		if (this.newFileLoaded) {
			console.log("jkb")
			this.notifyLoadingFileStatus()
			this.threeOrbitControlsService.setCamera()
			this.newFileLoaded = false
		}
	}

	private scaleMapAndNotify() {
		const s: Settings = this.lastRender.settings
		this.codeMapRenderService.scaleMap(s.appSettings.scaling, s.treeMapSettings.mapSize)
		this.notifyLoadingMapStatus()
	}

	private allNecessaryRenderDataAvailable(): boolean {
		return (
			this.lastRender.fileStates !== null &&
			this.lastRender.settings !== null &&
			this.lastRender.metricData !== null &&
			_.values(this.lastRender.settings.dynamicSettings).every(x => {
				return x !== null && _.values(x).every(x => x !== null)
			})
		)
	}

	private notifyLoadingFileStatus() {
		this.loadingGifService.updateLoadingFileFlag(false)
	}

	private notifyLoadingMapStatus() {
		this.loadingGifService.updateLoadingMapFlag(false)
	}

	private notifyMapChanged() {
		this.$rootScope.$broadcast(CodeMapPreRenderService.RENDER_MAP_CHANGED_EVENT, this.lastRender.map)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: CodeMapPreRenderServiceSubscriber) {
		$rootScope.$on(CodeMapPreRenderService.RENDER_MAP_CHANGED_EVENT, (event, data) => {
			subscriber.onRenderMapChanged(data)
		})
	}
}
