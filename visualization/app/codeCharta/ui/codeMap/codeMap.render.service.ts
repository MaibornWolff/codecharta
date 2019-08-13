"use strict"

import { CodeMapMesh } from "./rendering/codeMapMesh"
import { TreeMapGenerator } from "../../util/treeMapGenerator"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CodeMapNode, Settings, Node, FileState } from "../../codeCharta.model"
import { FileStateHelper } from "../../util/fileStateHelper"
import { RenderData } from "./codeMap.preRender.service"
import { Vector3 } from "three"

export class CodeMapRenderService {
	constructor(
		private threeSceneService: ThreeSceneService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapArrowService: CodeMapArrowService
	) {}

	public render(renderData: RenderData) {
		this.showAllOrOnlyFocusedNode(renderData.map, renderData.settings)
		const sortedNodes: Node[] = this.getSortedNodes(renderData)
		this.setNewMapMesh(sortedNodes, renderData.settings, renderData.fileStates)
		this.setLabels(sortedNodes, renderData.settings)
		this.setArrows(sortedNodes, renderData.settings)
		this.scaleMap(renderData.settings.appSettings.scaling, renderData.settings.treeMapSettings.mapSize)
	}

	private setNewMapMesh(sortedNodes, s: Settings, fileStates: FileState[]) {
		const mapMesh: CodeMapMesh = new CodeMapMesh(sortedNodes, s, FileStateHelper.isDeltaState(fileStates))
		this.threeSceneService.setMapMesh(mapMesh, s.treeMapSettings.mapSize)
	}

	public scaleMap(scale: Vector3, mapSize: number) {
		this.threeSceneService.scale(scale, mapSize)
		this.codeMapLabelService.scale(scale)
		this.codeMapArrowService.scale(scale)
	}

	private getSortedNodes(renderData: RenderData): Node[] {
		const nodes: Node[] = TreeMapGenerator.createTreemapNodes(renderData.map, renderData.settings, renderData.metricData)
		const filteredNodes: Node[] = nodes.filter(node => node.visible && node.length > 0 && node.width > 0)
		return filteredNodes.sort((a, b) => b.height - a.height)
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
			this.codeMapArrowService.addEdgeArrows(sortedNodes, visibleEdges)
		}
	}

	private showAllOrOnlyFocusedNode(map: CodeMapNode, s: Settings) {
		if (s.dynamicSettings.focusedNodePath.length > 0) {
			const focusedNode = CodeMapHelper.getAnyCodeMapNodeFromPath(s.dynamicSettings.focusedNodePath, map)
			TreeMapGenerator.setVisibilityOfNodeAndDescendants(map, false)
			TreeMapGenerator.setVisibilityOfNodeAndDescendants(focusedNode, true)
		} else {
			TreeMapGenerator.setVisibilityOfNodeAndDescendants(map, true)
		}
	}
}
