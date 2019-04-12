"use strict"

import {CodeMapMesh} from "./rendering/codeMapMesh"
import {Node} from "./rendering/node"
import {TreeMapService} from "./treemap/treemap.service"
import {CodeMapHelper} from "../../util/codeMapHelper"
import {CodeMapLabelService} from "./codeMap.label.service"
import {ThreeSceneService} from "./threeViewer/threeSceneService"
import {CodeMapArrowService} from "./codeMap.arrow.service"
import {
	CCFile,
	CodeMapNode,
	Edge,
	FileSelectionState,
	FileState,
	MetricData,
	Settings
} from "../../codeCharta.model"
import {SettingsService, SettingsServiceSubscriber} from "../../state/settings.service";
import {IAngularEvent, IRootScopeService} from "angular";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";
import _ from "lodash"
import {NodeDecorator} from "../../util/nodeDecorator";
import {AggregationGenerator} from "../../util/aggregationGenerator";
import {MetricService, MetricServiceSubscriber} from "../../state/metric.service";
import {FileStateHelper} from "../../util/fileStateHelper";
import {DeltaGenerator} from "../../util/deltaGenerator";
import {ThreeOrbitControlsService} from "./threeViewer/threeOrbitControlsService";

export interface RenderData {
	renderFile: CCFile
	fileStates: FileState[]
	settings: Settings,
	metricData: MetricData[]
}

export interface CodeMapRenderServiceSubscriber {
	onRenderFileChanged(renderFile: CCFile, event: IAngularEvent)
}

export class CodeMapRenderService implements SettingsServiceSubscriber, FileStateServiceSubscriber, MetricServiceSubscriber {
	public static SELECTOR = "codeMapRenderService"
	private static RENDER_FILE_CHANGED_EVENT = "render-file-changed";

	private _mapMesh: CodeMapMesh = null
	private autoFitMap: boolean = false

	private lastRender: RenderData = {
		renderFile: null,
		fileStates: null,
		settings: null,
		metricData: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private threeSceneService: ThreeSceneService,
		private threeOrbitControlsService: ThreeOrbitControlsService,
		private treeMapService: TreeMapService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapArrowService: CodeMapArrowService
	) {
		FileStateService.subscribe(this.$rootScope, this)
		MetricService.subscribe(this.$rootScope, this)
	}

	public init() {
		SettingsService.subscribe(this.$rootScope, this)
	}

	get mapMesh(): CodeMapMesh {
		return this._mapMesh;
	}

	public getRenderFile(): CCFile {
		return this.lastRender.renderFile
	}

	public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
		this.lastRender.settings = settings
		if (this.lastRender.fileStates) {
			this.lastRender.renderFile = this.getSelectedFilesAsUnifiedMap(this.lastRender.fileStates)
		}
		this.renderIfRenderObjectIsComplete()
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		this.lastRender.renderFile = this.getSelectedFilesAsUnifiedMap(fileStates)
		this.lastRender.fileStates = fileStates
		this.autoFitMap = true
		this.renderIfRenderObjectIsComplete()
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
	}

	public onMetricDataChanged(metricData: MetricData[], event: angular.IAngularEvent) {
		this.lastRender.metricData = metricData
		this.renderIfRenderObjectIsComplete()
	}

	private getSelectedFilesAsUnifiedMap(fileStates: FileState[]): CCFile {
		let visibleFileStates: FileState[] = FileStateHelper.getVisibleFileStates(fileStates)
		visibleFileStates.forEach(fileState => {
			fileState.file = NodeDecorator.preDecorateFile(fileState.file)
		})

		if (FileStateHelper.isSingleState(fileStates)) {
			return _.cloneDeep(visibleFileStates[0].file)

		} else if (FileStateHelper.isPartialState(fileStates)){
			return AggregationGenerator.getAggregationFile(visibleFileStates.map(x => x.file))

		} else if (FileStateHelper.isDeltaState(fileStates)) {
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
	}

	private renderIfRenderObjectIsComplete() {
		if (_.values(this.lastRender).every(x => (x !== null)) && this.lastRender.settings.dynamicSettings.neutralColorRange) {
			this.render(this.lastRender)
			if (this.autoFitMap) {
				this.threeOrbitControlsService.autoFitTo();
				this.autoFitMap = false
			}
			this.notifySubscriber()
		}
	}

	private render(renderData: RenderData) {
		renderData.renderFile = NodeDecorator.decorateFile(renderData.renderFile, renderData.settings, renderData.metricData)

		this.showAllOrOnlyFocusedNode(renderData.renderFile.map, renderData.settings)

		const treeMapNode: Node = this.treeMapService.createTreemapNodes(renderData.renderFile, renderData.settings, renderData.metricData)
		const nodes: Node[] = this.collectNodesToArray(treeMapNode)
		const filteredNodes: Node[] = nodes.filter(node => node.visible && node.length > 0 && node.width > 0)
		const sortedNodes: Node[] = filteredNodes.sort((a, b) => b.height - a.height)

		this._mapMesh = new CodeMapMesh(sortedNodes, renderData.settings, FileStateHelper.isDeltaState(renderData.fileStates))
		this.threeSceneService.setMapMesh(this._mapMesh, renderData.settings.treeMapSettings.mapSize)

		const scale = renderData.settings.appSettings.scaling
		this.scaleMap(scale.x, scale.y, scale.z, renderData.settings.treeMapSettings.mapSize)
		this.setLabels(sortedNodes, renderData.settings)
		this.setArrows(sortedNodes, renderData.settings)
	}

	private collectNodesToArray(node: Node): Node[] {
		let nodes = [node]
		for (let i = 0; i < node.children.length; i++) {
			let collected = this.collectNodesToArray(node.children[i])
			for (let j = 0; j < collected.length; j++) {
				nodes.push(collected[j])
			}
		}
		return nodes
	}

	private scaleMap(x: number, y: number, z: number, mapSize: number) {
		this.threeSceneService.mapGeometry.scale.set(x, y, z)
		this.threeSceneService.mapGeometry.position.set((- mapSize / 2.0) * x, 0.0, (- mapSize / 2.0) * z)

		if (this.threeSceneService.getMapMesh()) {
			this.threeSceneService.getMapMesh().setScale(x, y, z)
		}
		this.codeMapLabelService.scale(x, y, z)
		this.codeMapArrowService.scale(x, y, z)
	}

	private setLabels(sortedNodes: Node[], s: Settings) {
		this.codeMapLabelService.clearLabels()
		for (let i = 0, numAdded = 0; i < sortedNodes.length && numAdded < s.appSettings.amountOfTopLabels; ++i) {
			if (sortedNodes[i].isLeaf) {
				this.codeMapLabelService.addLabel(sortedNodes[i], s)
				++numAdded
			}
		}
	}

	private setArrows(sortedNodes: Node[], s: Settings) {
		this.codeMapArrowService.clearArrows()
		const visibleEdges = s.fileSettings.edges.filter(x => x.visible)
		if (visibleEdges.length > 0 && s.appSettings.enableEdgeArrows) {
			this.showCouplingArrows(sortedNodes, visibleEdges, s)
		}
	}

	private showAllOrOnlyFocusedNode(map: CodeMapNode, s: Settings) {
		if (s.dynamicSettings.focusedNodePath) {
			const focusedNode = CodeMapHelper.getAnyCodeMapNodeFromPath(s.dynamicSettings.focusedNodePath, map)
			this.treeMapService.setVisibilityOfNodeAndDescendants(map, false)
			this.treeMapService.setVisibilityOfNodeAndDescendants(focusedNode, true)
		} else {
			this.treeMapService.setVisibilityOfNodeAndDescendants(map, true)
		}
	}

	private showCouplingArrows(sortedNodes: Node[], edges: Edge[], s: Settings) {
		this.codeMapArrowService.clearArrows()

		if (edges && s) {
			this.codeMapArrowService.addEdgeArrows(sortedNodes, edges, s)
			this.codeMapArrowService.scale(
				this.threeSceneService.mapGeometry.scale.x,
				this.threeSceneService.mapGeometry.scale.y,
				this.threeSceneService.mapGeometry.scale.z
			)
		}
	}

	private notifySubscriber() {
		this.$rootScope.$broadcast(CodeMapRenderService.RENDER_FILE_CHANGED_EVENT, this.lastRender.renderFile)
	}

	public static subscribe($rootScope: IRootScopeService, subscriber: CodeMapRenderServiceSubscriber) {
		$rootScope.$on(CodeMapRenderService.RENDER_FILE_CHANGED_EVENT, (event, data) => {
			subscriber.onRenderFileChanged(data, event)
		})
	}
}
