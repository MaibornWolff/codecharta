"use strict"

import {CodeMapMesh} from "./rendering/codeMapMesh"
import {Node} from "./rendering/node"
import {TreeMapService} from "./treemap/treemap.service"
import {CodeMapUtilService} from "./codeMap.util.service"
import {CodeMapLabelService} from "./codeMap.label.service"
import {ThreeSceneService} from "./threeViewer/threeSceneService"
import {CodeMapArrowService} from "./codeMap.arrow.service"
import {CCFile, CodeMapNode, Edge, FileState, MetricData, Settings,} from "../../codeCharta.model"
import {SettingsService, SettingsServiceSubscriber} from "../../state/settings.service";
import {IRootScopeService} from "angular";
import {FileStateService, FileStateServiceSubscriber} from "../../state/fileState.service";
import _ from "lodash"
import {CodeMapNodeDecoratorService} from "./codeMap.nodeDecorator.service";
import {MultipleState} from "../../util/multipleState";
import {MetricStateService, MetricStateServiceSubscriber} from "../../state/metricState.service";
import {FileStateHelper} from "../../util/fileStateHelper";

export interface RenderData {
	renderFile: CCFile
	fileStates: FileState[]
	settings: Settings,
	metricData: MetricData[]
}

export class CodeMapRenderService implements SettingsServiceSubscriber, FileStateServiceSubscriber, MetricStateServiceSubscriber {
	public static SELECTOR = "codeMapRenderService"

	public currentSortedNodes: Node[]

	private _mapMesh: CodeMapMesh = null
	private visibleEdges: Edge[]

	// TODO: getter method to getLastRenderMap()
	private lastRender: RenderData = {
		renderFile: null,
		fileStates: null,
		settings: null,
		metricData: null
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
		//SettingsService.subscribe(this.$rootScope, this)
		FileStateService.subscribe(this.$rootScope, this)
		MetricStateService.subscribe(this.$rootScope, this)
	}

	public init() {
		SettingsService.subscribe(this.$rootScope, this)
	}

	public onSettingsChanged(settings: Settings, event: angular.IAngularEvent) {
		// TODO: for whatever reason this onSettingsChanged() always gets called twice
		this.lastRender.settings = settings
		console.log("lastSettings", settings)
		this.renderIfRenderObjectIsComplete()
	}

	public onFileSelectionStatesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
		console.log("fileStates", fileStates);
		this.lastRender.renderFile = this.getSelectedFilesAsUnifiedMap(fileStates)
		// TODO: this renderFile has to be undecorated at this stage (doesnt work really)
		this.lastRender.fileStates = fileStates
		this.renderIfRenderObjectIsComplete()
	}

	public onImportedFilesChanged(fileStates: FileState[], event: angular.IAngularEvent) {
	}

	public onMetricDataChanged(metricData: MetricData[], event: angular.IAngularEvent) {
		this.lastRender.metricData = metricData
		this.renderIfRenderObjectIsComplete()
	}



	private getSelectedFilesAsUnifiedMap(fileStates: FileState[]): CCFile {
		const visibleFileStates: FileState[] = FileStateHelper.getVisibleFileStates(fileStates)
		if (FileStateHelper.isDeltaState(fileStates)) {
			console.log("Delta State")
			/* TODO: set combined fileSettings from CCFile into settingsService.settings
			const referenceFile = visibleFileStates.filter(x => x.selectedAs == FileSelectionState.Reference)
			const comparisonFile = visibleFileStates.filter(x => x.selectedAs == FileSelectionState.Comparison)
			this.deltaCalculatorService.removeCrossOriginNodes(referenceFile)
			this.deltaCalculatorService.provideDeltas(referenceFile, comparisonFile, metrics)
			*/

		} else if (FileStateHelper.isPartialState(fileStates)){
			console.log("Partial State")
			return MultipleState.aggregateMaps(visibleFileStates.map(x => x.file))
		} else {
			console.log("Single State")
			return visibleFileStates[0].file
		}
	}

	private renderIfRenderObjectIsComplete() {
		console.log("lastRender", this.lastRender);
		if (_.values(this.lastRender).every(x => (x !== null)) && this.lastRender.settings.dynamicSettings.neutralColorRange) {
			this.render(this.lastRender)
		}
	}

	private render(renderData: RenderData) {
		// TODO: give parameter MetricData and adapt decorateFiles methods
		renderData.renderFile = this.codeMapNodeDecoratorService.decorateFiles(renderData.renderFile, renderData.metricData.map(x => x.name))
		console.log("decorated renderFile", renderData.renderFile)
		this.updateMapGeometry(renderData.renderFile, renderData.fileStates, renderData.settings, renderData.metricData)
		this.scaleMap(
			renderData.settings.appSettings.scaling.x,
			renderData.settings.appSettings.scaling.y,
			renderData.settings.appSettings.scaling.z,
			renderData.settings.treeMapSettings.mapSize
		)
	}

	private updateMapGeometry(renderFile: CCFile, fileStates: FileState[], s: Settings, metricData: MetricData[]) {
		this.visibleEdges = this.getVisibleEdges(renderFile.map, s)

		this.showAllOrOnlyFocusedNode(renderFile.map, s)

		const treeMapNode: Node = this.treeMapService.createTreemapNodes(renderFile, s, metricData)
		const nodes: Node[] = this.collectNodesToArray(treeMapNode)
		const filteredNodes: Node[] = nodes.filter(node => node.visible && node.length > 0 && node.width > 0)
		this.currentSortedNodes = filteredNodes.sort((a, b) => b.height - a.height)

		this.setLabels(s)
		this.setArrows(s)

		this._mapMesh = new CodeMapMesh(this.currentSortedNodes, s, FileStateHelper.isDeltaState(fileStates))
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
