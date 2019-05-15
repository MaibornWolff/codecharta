"use strict"

import { CodeMapMesh } from "./rendering/codeMapMesh"
import { TreeMapGenerator } from "../../util/treeMapGenerator"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CodeMapNode, Edge, Settings, Node } from "../../codeCharta.model"
import { FileStateHelper } from "../../util/fileStateHelper"
import { RenderData } from "./codeMap.preRender.service"

export class CodeMapRenderService {
	private _mapMesh: CodeMapMesh = null

	constructor(
		private threeSceneService: ThreeSceneService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapArrowService: CodeMapArrowService
	) {}

	get mapMesh(): CodeMapMesh {
		return this._mapMesh
	}

	public render(renderData: RenderData) {
		this.showAllOrOnlyFocusedNode(renderData.renderFile.map, renderData.settings)

		const treeMapNode: Node = TreeMapGenerator.createTreemapNodes(renderData.renderFile, renderData.settings, renderData.metricData)
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
		this.threeSceneService.mapGeometry.position.set((-mapSize / 2.0) * x, 0.0, (-mapSize / 2.0) * z)

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
		if (s.dynamicSettings.focusedNodePath.length > 0) {
			const focusedNode = CodeMapHelper.getAnyCodeMapNodeFromPath(s.dynamicSettings.focusedNodePath, map)
			TreeMapGenerator.setVisibilityOfNodeAndDescendants(map, false)
			TreeMapGenerator.setVisibilityOfNodeAndDescendants(focusedNode, true)
		} else {
			TreeMapGenerator.setVisibilityOfNodeAndDescendants(map, true)
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
}
