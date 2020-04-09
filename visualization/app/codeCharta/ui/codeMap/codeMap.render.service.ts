"use strict"

import { CodeMapMesh } from "./rendering/codeMapMesh"
import { TreeMapGenerator } from "../../util/treeMapGenerator"
import { CodeMapHelper } from "../../util/codeMapHelper"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CodeMapNode, Node, LayoutAlgorithm } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { MetricService } from "../../state/metric.service"
import { StreetLayoutGenerator } from "../../util/streetLayoutGenerator"

export class CodeMapRenderService {
	constructor(
		private storeService: StoreService,
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
			this.storeService.getState().files.isDeltaState()
		)
		this.threeSceneService.setMapMesh(mapMesh)
	}

	public scaleMap() {
		this.threeSceneService.scale()
		this.codeMapLabelService.scale()
		this.codeMapArrowService.scale()
	}

	private getSortedNodes(map: CodeMapNode): Node[] {
		let nodes: Node[] = []
		const state = this.storeService.getState()
		const metricService = this.metricService.getMetricData()
		const layoutAlgorithm = state.appSettings.layoutAlgorithm

		switch (layoutAlgorithm) {
			case LayoutAlgorithm.SquarifiedTreeMap:
				nodes = TreeMapGenerator.createTreemapNodes(map, state, metricService)
				break
			case LayoutAlgorithm.StreetMap:
				nodes = StreetLayoutGenerator.createStreetLayoutNodes(map, state, metricService)
				break
			case LayoutAlgorithm.TMStreet:
				nodes = StreetLayoutGenerator.createStreetLayoutNodes(map, state, metricService)
				break
			default:
				throw new Error(`Layout Algorithm "${layoutAlgorithm}" is not defined.`)
		}

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
				this.codeMapLabelService.addLabel(sortedNodes[i])
				++numAdded
			}
		}
	}

	private setArrows(sortedNodes: Node[]) {
		this.codeMapArrowService.clearArrows()
		const edges = this.storeService.getState().fileSettings.edges
		if (edges.length > 0) {
			this.codeMapArrowService.addEdgePreview(sortedNodes, edges)
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
