"use strict"

import { CodeMapMesh } from "./rendering/codeMapMesh"
import { TreeMapGenerator } from "../../util/treeMapGenerator"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CodeMapNode, Node } from "../../codeCharta.model"
import { FileStateHelper } from "../../util/fileStateHelper"
import { StoreService } from "../../state/store.service"
import { FileStateService } from "../../state/fileState.service"
import { MetricService } from "../../state/metric.service"

export class CodeMapRenderService {
	constructor(
		private storeService: StoreService,
		private fileStateService: FileStateService,
		private metricService: MetricService,
		private threeSceneService: ThreeSceneService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapArrowService: CodeMapArrowService
	) {}

	public render(map: CodeMapNode) {
		this.showAllOrOnlyFocusedNode(map)
		const sortedNodes: Node[] = this.getSortedNodes(map)
		this.setNewMapMesh(sortedNodes)
		this.setLabels(sortedNodes)
		this.setArrows(sortedNodes)
		this.scaleMap()
	}

	private setNewMapMesh(sortedNodes) {
		const mapMesh: CodeMapMesh = new CodeMapMesh(
			sortedNodes,
			this.storeService.getState(),
			FileStateHelper.isDeltaState(this.fileStateService.getFileStates())
		)
		this.threeSceneService.setMapMesh(mapMesh, this.storeService.getState().treeMap.mapSize)
	}

	public scaleMap() {
		const scale = this.storeService.getState().appSettings.scaling
		const mapSize = this.storeService.getState().treeMap.mapSize
		this.threeSceneService.scale(scale, mapSize)
		this.codeMapLabelService.scale(scale)
		this.codeMapArrowService.scale(scale)
	}

	private getSortedNodes(map: CodeMapNode): Node[] {
		const nodes: Node[] = TreeMapGenerator.createTreemapNodes(
			map,
			this.storeService.getState(),
			this.metricService.getMetricData(),
			FileStateHelper.isDeltaState(this.fileStateService.getFileStates())
		)
		const filteredNodes: Node[] = nodes.filter(node => node.visible && node.length > 0 && node.width > 0)
		return filteredNodes.sort((a, b) => b.height - a.height)
	}

	private setLabels(sortedNodes: Node[]) {
		this.codeMapLabelService.clearLabels()
		for (
			let i = 0, numAdded = 0;
			i < sortedNodes.length && numAdded < this.storeService.getState().appSettings.amountOfTopLabels;
			++i
		) {
			if (sortedNodes[i].isLeaf) {
				this.codeMapLabelService.addLabel(sortedNodes[i], this.storeService.getState())
				++numAdded
			}
		}
	}

	private setArrows(sortedNodes: Node[]) {
		this.codeMapArrowService.clearArrows()
		if (this.storeService.getState().fileSettings.edges.length > 0) {
			this.codeMapArrowService.addEdgeArrows(sortedNodes, this.storeService.getState().fileSettings.edges)
		}
	}

	private showAllOrOnlyFocusedNode(map: CodeMapNode) {
		if (this.storeService.getState().dynamicSettings.focusedNodePath.length > 0) {
			const focusedNode = CodeMapHelper.getAnyCodeMapNodeFromPath(this.storeService.getState().dynamicSettings.focusedNodePath, map)
			TreeMapGenerator.setVisibilityOfNodeAndDescendants(map, false)
			TreeMapGenerator.setVisibilityOfNodeAndDescendants(focusedNode, true)
		} else {
			TreeMapGenerator.setVisibilityOfNodeAndDescendants(map, true)
		}
	}
}
