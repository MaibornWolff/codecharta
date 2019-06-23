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
import { Vector3 } from "three"

export class CodeMapRenderService {
	private mapMesh: CodeMapMesh = null

	constructor(
		private threeSceneService: ThreeSceneService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapArrowService: CodeMapArrowService
	) {}

	public getMapMesh(): CodeMapMesh {
		return this.mapMesh
	}

	public render(renderData: RenderData) {
		this.showAllOrOnlyFocusedNode(renderData.renderFile.map, renderData.settings)

		const treeMapNode: Node = TreeMapGenerator.createTreemapNodes(renderData.renderFile, renderData.settings, renderData.metricData)
		const nodes: Node[] = this.collectNodesToArray(treeMapNode)
		const filteredNodes: Node[] = nodes.filter(node => node.visible && node.length > 0 && node.width > 0)
		const sortedNodes: Node[] = filteredNodes.sort((a, b) => this.sortByNodeHeight(a, b))

		this.mapMesh = new CodeMapMesh(sortedNodes, renderData.settings, FileStateHelper.isDeltaState(renderData.fileStates))
		this.threeSceneService.setMapMesh(this.mapMesh, renderData.settings.treeMapSettings.mapSize)

		this.scaleMap(renderData.settings.appSettings.scaling, renderData.settings.treeMapSettings.mapSize)
		this.setLabels(sortedNodes, renderData.settings)
		this.setArrows(sortedNodes, renderData.settings)
	}

	public scaleMap(scale: Vector3, mapSize: number) {
		this.threeSceneService.mapGeometry.scale.set(scale.x, scale.y, scale.z)
		this.threeSceneService.mapGeometry.position.set((-mapSize / 2.0) * scale.x, 0.0, (-mapSize / 2.0) * scale.z)
		this.threeSceneService.getMapMesh().setScale(scale)
		this.codeMapLabelService.scale(scale)
		this.codeMapArrowService.scale(scale)
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

	private sortByNodeHeight(a: Node, b: Node) {
		return b.height - a.height
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
			this.codeMapArrowService.scale(this.threeSceneService.mapGeometry.scale)
		}
	}
}
