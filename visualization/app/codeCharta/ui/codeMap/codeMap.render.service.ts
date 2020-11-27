"use strict"

import { CodeMapMesh } from "./rendering/codeMapMesh"
import { createTreemapNodes } from "../../util/treeMapGenerator"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CodeMapNode, Node } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { isDeltaState } from "../../model/files/files.helper"
import { FileState } from "../../model/files/files"

const ONE_MB = 1024 * 1024

export function getMapResolutionScaleFactor(files: FileState[]) {
	let totalFileSize = 0
	for (const file of files) {
		totalFileSize += file.file.fileMeta.exportedFileSize
	}

	switch (true) {
		case totalFileSize >= 5 * ONE_MB:
			return 0.25
		case totalFileSize >= ONE_MB:
			return 0.5
		default:
			return 1
	}
}

export class CodeMapRenderService {
	constructor(
		private storeService: StoreService,
		private threeSceneService: ThreeSceneService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapArrowService: CodeMapArrowService
	) {}

	render(map: CodeMapNode) {
		const sortedNodes = this.getSortedNodes(map)
		this.setNewMapMesh(sortedNodes)
		this.setLabels(sortedNodes)
		this.setArrows(sortedNodes)
		this.scaleMap()
	}

	private setNewMapMesh(sortedNodes) {
		const state = this.storeService.getState()
		const mapMesh = new CodeMapMesh(sortedNodes, state, isDeltaState(state.files))
		this.threeSceneService.setMapMesh(mapMesh)
	}

	scaleMap() {
		this.threeSceneService.scale()
		this.codeMapLabelService.scale()
		this.codeMapArrowService.scale()
	}

	private getSortedNodes(map: CodeMapNode) {
		const state = this.storeService.getState()
		const nodes = createTreemapNodes(map, state, state.metricData.nodeMetricData, isDeltaState(state.files))
		// TODO: Move the filtering step into `createTreemapNodes`. It's possible to
		// prevent multiple steps if the visibility is checked first.
		const filteredNodes = nodes.filter(node => node.visible && node.length > 0 && node.width > 0)
		return filteredNodes.sort((a, b) => b.height - a.height)
	}

	private setLabels(sortedNodes: Node[]) {
		const appSettings = this.storeService.getState().appSettings
		const showLabelNodeName = appSettings.showMetricLabelNodeName
		const showLabelNodeMetric = appSettings.showMetricLabelNameValue
		const hightestNode = this.getHighestNode(sortedNodes)

		this.codeMapLabelService.clearLabels()
		if (showLabelNodeName || showLabelNodeMetric) {
			let { amountOfTopLabels } = appSettings
			for (let index = 0; index < sortedNodes.length && amountOfTopLabels !== 0; index++) {
				if (sortedNodes[index].isLeaf) {
					//get neighbors with label
					//neighbor ==> width + margin + 1
					this.codeMapLabelService.addLabel(
						sortedNodes[index],
						{
							showNodeName: showLabelNodeName,
							showNodeMetric: showLabelNodeMetric
						},
						hightestNode
					)
					amountOfTopLabels -= 1
				}
			}
		}
	}

	private getHighestNode(sortedNodes: Node[]) {
		const sortedNodeValues = sortedNodes.map(node => node.height)
		return Math.max(...sortedNodeValues)
	}

	private setArrows(sortedNodes: Node[]) {
		this.codeMapArrowService.clearArrows()
		this.codeMapArrowService.addEdgePreview(sortedNodes)
	}
}
