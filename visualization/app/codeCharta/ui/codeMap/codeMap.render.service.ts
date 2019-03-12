"use strict"

import {CodeMapMesh} from "./rendering/codeMapMesh"
import {Node} from "./rendering/node"
import {TreeMapService} from "../../core/treemap/treemap.service"
import {CodeMapUtilService} from "./codeMap.util.service"
import {CodeMapLabelService} from "./codeMap.label.service"
import {ThreeSceneService} from "./threeViewer/threeSceneService"
import {CodeMapArrowService} from "./codeMap.arrow.service"
import {CCFile, CodeMapNode, Edge, FileSelectionState, FileState, Settings,} from "../../codeCharta.model"
import {SettingsService, SettingsServiceSubscriber} from "../../state/settings.service";
import {IRootScopeService} from "angular";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";
import _ from "lodash"
import {CodeMapNodeDecoratorService} from "./codeMap.nodeDecorator.service";
import {MetricCalculator} from "../../MetricCalculator";
import {MultipleFileService} from "../../core/multipleFile/multipleFile.service";

export interface RenderData {
	renderMap: CodeMapNode
	fileName: string
	files: CCFile[]
	settings: Settings
	renderState: FileSelectionState
}

export class CodeMapRenderService implements SettingsServiceSubscriber, FileStateServiceSubscriber {
	public static SELECTOR = "codeMapRenderService"

	public currentSortedNodes: Node[]

	private _mapMesh: CodeMapMesh = null
	private visibleEdges: Edge[]

	private lastRender: RenderData = {
		renderMap: null,
		fileName: null,
		files: null,
		settings: null,
		renderState: null
	}

	constructor(
		private $rootScope: IRootScopeService,
		private threeSceneService: ThreeSceneService,
		private treeMapService: TreeMapService,
		private codeMapUtilService: CodeMapUtilService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapArrowService: CodeMapArrowService,
		private codeMapNodeDecoratorService: CodeMapNodeDecoratorService
	) {
		SettingsService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
	}

	public init() {
		SettingsService.subscribe(this.$rootScope, this)
	}

	public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
		this.lastRender.settings = settings
		this.renderIfRenderObjectIsComplete()
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		// TODO: calculate metrics everytime, access from codeChartaService or somewhere else?
		this.codeMapNodeDecoratorService.decorateFiles(fileStates.map(x => x.file), MetricCalculator.calculateMetrics(fileStates.map(x => x.file)).metrics)

		this.lastRender.renderMap = this.getSelectedFilesAsUnifiedMap(fileStates)
		this.lastRender.files = fileStates.map(x => x.file)
		this.lastRender.fileName = fileStates.find(x => x.selectedAs == FileSelectionState.Single).file.fileMeta.fileName
		this.lastRender.renderState = FileStateService.getRenderState(fileStates)
		this.renderIfRenderObjectIsComplete()
	}

	private getSelectedFilesAsUnifiedMap(fileStates: FileState[]): CodeMapNode {
		if (this.lastRender.renderState == FileSelectionState.Comparison) {
			/*return fileStates
				.filter(x => x.selectedAs == FileSelectionState.Comparison || x.selectedAs == FileSelectionState.Reference)
				.map(x => x.file)*/
		} else if (this.lastRender.renderState == FileSelectionState.Partial){
			const partialFiles = fileStates
				.filter(x => x.selectedAs == FileSelectionState.Partial)
				.map(x => x.file)
			return MultipleFileService.aggregateMaps(partialFiles).map
		} else {
			return fileStates.find(x => x.selectedAs == FileSelectionState.Single).file.map
		}
	}

	private renderIfRenderObjectIsComplete() {
		console.log("lastRender", this.lastRender);
		if (_.values(this.lastRender).every(x => (x !== null))) {
			this.render(this.lastRender)
		}
	}

	private render(renderData: RenderData) {
		this.updateMapGeometry(renderData.renderMap, renderData.fileName, renderData.files, renderData.settings, renderData.renderState)
		this.scaleMap(
			renderData.settings.appSettings.scaling.x,
			renderData.settings.appSettings.scaling.y,
			renderData.settings.appSettings.scaling.z,
			renderData.settings.treeMapSettings.mapSize
		)
	}

	private updateMapGeometry(map: CodeMapNode, fileName: string, importedFiles: CCFile[], s: Settings, renderState: FileSelectionState) {
		this.visibleEdges = this.getVisibleEdges(map, s)

		this.showAllOrOnlyFocusedNode(map, s)

		const treeMapNode: Node = this.treeMapService.createTreemapNodes(map, importedFiles, s)
		const nodes: Node[] = this.collectNodesToArray(treeMapNode)
		const filteredNodes = nodes.filter(node => node.visible && node.length > 0 && node.width > 0)
		this.currentSortedNodes = filteredNodes.sort((a, b) => b.height - a.height)

		this.setLabels(s)
		this.setArrows(s)

		this._mapMesh = new CodeMapMesh(this.currentSortedNodes, s, renderState)
		this.threeSceneService.setMapMesh(this._mapMesh, s.treeMapSettings.mapSize)
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
		this.threeSceneService.mapGeometry.scale.x = x
		this.threeSceneService.mapGeometry.scale.y = y
		this.threeSceneService.mapGeometry.scale.z = z

		this.threeSceneService.mapGeometry.position.x = (- mapSize / 2.0) * x
		this.threeSceneService.mapGeometry.position.y = 0.0
		this.threeSceneService.mapGeometry.position.z = (- mapSize / 2.0) * z

		if (this.threeSceneService.getMapMesh()) {
			this.threeSceneService.getMapMesh().setScale(x, y, z)
		}

		if (this.codeMapLabelService) {
			this.codeMapLabelService.scale(x, y, z)
		}

		if (this.codeMapArrowService) {
			this.codeMapArrowService.scale(x, y, z)
		}
	}

	private setLabels(s: Settings) {
		this.codeMapLabelService.clearLabels()
		for (let i = 0, numAdded = 0; i < this.currentSortedNodes.length && numAdded < s.appSettings.amountOfTopLabels; ++i) {
			if (this.currentSortedNodes[i].isLeaf) {
				this.codeMapLabelService.addLabel(this.currentSortedNodes[i], s)
				++numAdded
			}
		}
	}

	private setArrows(s: Settings) {
		this.codeMapArrowService.clearArrows()
		if (this.visibleEdges.length > 0 && s.appSettings.enableEdgeArrows) {
			this.showCouplingArrows(this.visibleEdges, s)
		}
	}

	private showAllOrOnlyFocusedNode(map: CodeMapNode, s: Settings) {
		if (s.dynamicSettings.focusedNodePath) {
			const focusedNode = this.codeMapUtilService.getAnyCodeMapNodeFromPath(s.dynamicSettings.focusedNodePath, map)
			this.treeMapService.setVisibilityOfNodeAndDescendants(map, false)
			this.treeMapService.setVisibilityOfNodeAndDescendants(focusedNode, true)
		} else {
			this.treeMapService.setVisibilityOfNodeAndDescendants(map, true)
		}
	}

	private getVisibleEdges(map: CodeMapNode, s: Settings) {
		return map && s.fileSettings.edges ? s.fileSettings.edges.filter(edge => edge.visible === true) : []
	}

	private showCouplingArrows(edges: Edge[], s: Settings) {
		this.codeMapArrowService.clearArrows()

		if (edges && s) {
			this.codeMapArrowService.addEdgeArrows(this.currentSortedNodes, edges, s)
			this.codeMapArrowService.scale(
				this.threeSceneService.mapGeometry.scale.x,
				this.threeSceneService.mapGeometry.scale.y,
				this.threeSceneService.mapGeometry.scale.z
			)
		}
	}
}
