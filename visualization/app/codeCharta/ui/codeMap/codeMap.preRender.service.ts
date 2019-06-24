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
import { SettingsService, SettingsServiceSubscriber } from "../../state/settings.service"
import { IAngularEvent, IRootScopeService } from "angular"
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

export interface RenderData {
	renderFile: CCFile
	map: CodeMapNode
	fileStates: FileState[]
	settings: Settings
	metricData: MetricData[]
}

export interface CodeMapPreRenderServiceSubscriber {
	onRenderMapChanged(map: CodeMapNode, event: IAngularEvent)
}

export class CodeMapPreRenderService implements SettingsServiceSubscriber, FileStateServiceSubscriber, MetricServiceSubscriber {
	private static RENDER_FILE_CHANGED_EVENT = "render-file-changed"

	private newFileLoaded: boolean = false

	private lastRender: RenderData = {
		renderFile: null,
		map: null,
		fileStates: null,
		settings: null,
		metricData: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private codeMapRenderService: CodeMapRenderService,
		private loadingGifService: LoadingGifService
	) {
		FileStateService.subscribe(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
		SettingsService.subscribe(this.$rootScope, this)
	}

	public getRenderMap(): CodeMapNode {
		return this.lastRender.map
	}

	public getRenderFileMeta(): FileMeta {
		return this.lastRender.renderFile.fileMeta
	}

	public onSettingsChanged(settings: Settings, update: RecursivePartial<Settings>, event: angular.IAngularEvent) {
		this.lastRender.settings = settings

		if (this.lastRender.fileStates && update.fileSettings && (update.fileSettings.blacklist || update.fileSettings.markedPackages)) {
			this.lastRender.renderFile = this.getSelectedFilesAsUnifiedMap(this.lastRender.fileStates)
			this.lastRender.map = this.getSelectedFilesAsUnifiedMap(this.lastRender.fileStates).map
			this.lastRender.renderFile.settings.fileSettings = settings.fileSettings
			this.decorateIfPossible()
		}

		if (this.settingsOnlyContainNewScaling(update)) {
			this.scaleMapIfRenderObjectIsComplete()
		} else {
			this.renderIfRenderObjectIsComplete()
		}
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this.lastRender.fileStates = fileStates
		this.newFileLoaded = true
		this.lastRender.renderFile = this.getSelectedFilesAsUnifiedMap(this.lastRender.fileStates)
		this.lastRender.map = this.getSelectedFilesAsUnifiedMap(this.lastRender.fileStates).map
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {}

	public onMetricDataAdded(metricData: MetricData[], event: angular.IAngularEvent) {
		this.lastRender.metricData = metricData
		this.decorateIfPossible()
		this.renderIfRenderObjectIsComplete()
	}

	public onMetricDataRemoved(event: angular.IAngularEvent) {
		this.lastRender.metricData = null
	}

	private decorateIfPossible() {
		if (
			this.lastRender.renderFile &&
			this.lastRender.map &&
			this.lastRender.settings &&
			this.lastRender.settings.fileSettings &&
			this.lastRender.settings.fileSettings.blacklist &&
			this.lastRender.metricData
		) {
			this.lastRender.map = NodeDecorator.decorateMap(
				this.lastRender.map,
				this.lastRender.renderFile.fileMeta,
				this.lastRender.settings.fileSettings.blacklist,
				this.lastRender.metricData
			)
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

	private renderIfRenderObjectIsComplete() {
		if (this.allNecessaryRenderDataAvailable()) {
			this.codeMapRenderService.render(this.lastRender)

			this.notifyLoadingMapStatus()
			this.notifyFileChanged()
			if (this.newFileLoaded) {
				this.notifyLoadingFileStatus()
				this.threeOrbitControlsService.autoFitTo()
				this.newFileLoaded = false
			}
		}
	}

	private scaleMapIfRenderObjectIsComplete() {
		if (this.allNecessaryRenderDataAvailable()) {
			const s: Settings = this.lastRender.settings
			this.codeMapRenderService.scaleMap(s.appSettings.scaling, s.treeMapSettings.mapSize)
			this.notifyLoadingMapStatus()
			this.notifyFileChanged()
		}
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

	private notifyFileChanged() {
		this.$rootScope.$broadcast(CodeMapPreRenderService.RENDER_FILE_CHANGED_EVENT, this.lastRender.map)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: CodeMapPreRenderServiceSubscriber) {
		$rootScope.$on(CodeMapPreRenderService.RENDER_FILE_CHANGED_EVENT, (event, data) => {
			subscriber.onRenderMapChanged(data, event)
		})
	}
}
