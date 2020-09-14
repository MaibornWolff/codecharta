"use strict"

import { CodeMapMesh } from "./rendering/codeMapMesh"
import { TreeMapGenerator } from "../../util/treeMapGenerator"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CodeMapNode, Node } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { isDeltaState } from "../../model/files/files.helper"

export class CodeMapRenderService {
	constructor(
		private storeService: StoreService,
		private threeSceneService: ThreeSceneService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapArrowService: CodeMapArrowService
	) {}

	public render(map: CodeMapNode) {
		const sortedNodes = this.getSortedNodes(map)
		this.setNewMapMesh(sortedNodes)
		this.setLabels(sortedNodes)
		this.setArrows(sortedNodes)
		this.scaleMap()
	}

	private setNewMapMesh(sortedNodes) {
		const mapMesh = new CodeMapMesh(sortedNodes, this.storeService.getState(), isDeltaState(this.storeService.getState().files))
		this.threeSceneService.setMapMesh(mapMesh)
	}

	public scaleMap() {
		this.threeSceneService.scale()
		this.codeMapLabelService.scale()
		this.codeMapArrowService.scale()
	}

	private getSortedNodes(map: CodeMapNode) {
		const nodes = TreeMapGenerator.createTreemapNodes(
			map,
			this.storeService.getState(),
			this.storeService.getState().metricData.nodeMetricData,
			isDeltaState(this.storeService.getState().files)
		)
		const filteredNodes = nodes.filter(node => node.visible && node.length > 0 && node.width > 0)
		return filteredNodes.sort((a, b) => b.height - a.height)
	}

	private setLabels(sortedNodes: Node[]) {
		this.codeMapLabelService.clearLabels()
		for (
			let i = 0, numberAdded = 0;
			i < sortedNodes.length && numberAdded < this.storeService.getState().appSettings.amountOfTopLabels;
			++i
		) {
			if (sortedNodes[i].isLeaf) {
				this.codeMapLabelService.addLabel(sortedNodes[i])
				++numberAdded
			}
		}
	}

	private setArrows(sortedNodes: Node[]) {
		this.codeMapArrowService.clearArrows()
		const { edges } = this.storeService.getState().fileSettings
		if (edges.length > 0) {
			this.codeMapArrowService.addEdgePreview(sortedNodes, edges)
		}
	}
}
