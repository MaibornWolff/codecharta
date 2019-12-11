"use strict"

import { CodeMapMesh } from "./rendering/codeMapMesh"
import { TreeMapGenerator } from "../../util/treeMapGenerator"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CodeMapNode, Node, FileState } from "../../codeCharta.model"
import { FileStateHelper } from "../../util/fileStateHelper"
import { RenderData } from "./codeMap.preRender.service"
import { StoreService } from "../../state/store.service"

export class CodeMapRenderService {
	constructor(
		private storeService: StoreService,
		private threeSceneService: ThreeSceneService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapArrowService: CodeMapArrowService
	) {}

	public render(renderData: RenderData) {
		this.showAllOrOnlyFocusedNode(renderData.map)
		const sortedNodes: Node[] = this.getSortedNodes(renderData)
		this.setNewMapMesh(sortedNodes, renderData.fileStates)
		this.setLabels(sortedNodes)
		this.setArrows(sortedNodes)
		this.scaleMap()
	}

	private setNewMapMesh(sortedNodes, fileStates: FileState[]) {
		const mapMesh: CodeMapMesh = new CodeMapMesh(sortedNodes, this.storeService.getState(), FileStateHelper.isDeltaState(fileStates))
		this.threeSceneService.setMapMesh(mapMesh, this.storeService.getState().treeMap.mapSize)
	}

	public scaleMap() {
		const scale = this.storeService.getState().appSettings.scaling
		const mapSize = this.storeService.getState().treeMap.mapSize
		this.threeSceneService.scale(scale, mapSize)
		this.codeMapLabelService.scale(scale)
		this.codeMapArrowService.scale(scale)
	}

	private getSortedNodes(renderData: RenderData): Node[] {
		const nodes: Node[] = TreeMapGenerator.createTreemapNodes(
			renderData.map,
			this.storeService.getState(),
			renderData.metricData,
			FileStateHelper.isDeltaState(renderData.fileStates)
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
