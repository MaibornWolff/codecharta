"use strict"

import { CodeMapMesh } from "./rendering/codeMapMesh"
import * as SquarifiedLayoutGenerator from "../../util/algorithm/treeMapLayout/treeMapGenerator"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import { CodeMapNode, LayoutAlgorithm, Node } from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { isDeltaState } from "../../model/files/files.helper"
import { StreetLayoutGenerator } from "../../util/algorithm/streetLayout/streetLayoutGenerator"
import { IsLoadingFileService, IsLoadingFileSubscriber } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.service"
import { IRootScopeService } from "angular"

export class CodeMapRenderService implements IsLoadingFileSubscriber{
	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private threeSceneService: ThreeSceneService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapArrowService: CodeMapArrowService
	) {
		IsLoadingFileService.subscribe(this.$rootScope, this)
	}
	onIsLoadingFileChanged(isLoadingFile: boolean) {
		if (isLoadingFile && this.threeSceneService!==undefined) {
			this.threeSceneService.dispose()
		}
	}

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
		this.codeMapLabelService.scale()
		this.codeMapArrowService.scale()
		this.threeSceneService.scaleHeight()
	}

	private getSortedNodes(map: CodeMapNode) {
		const state = this.storeService.getState()
		const {
			appSettings: { layoutAlgorithm },
			metricData
		} = state
		let nodes: Node[] = []
		switch (layoutAlgorithm) {
			case LayoutAlgorithm.StreetMap:
			case LayoutAlgorithm.TreeMapStreet:
				nodes = StreetLayoutGenerator.createStreetLayoutNodes(map, state, metricData.nodeMetricData, isDeltaState(state.files))
				break
			case LayoutAlgorithm.SquarifiedTreeMap:
				nodes = SquarifiedLayoutGenerator.createTreemapNodes(map, state, state.metricData.nodeMetricData, isDeltaState(state.files))
				break
		}
		// TODO: Move the filtering step into `createTreemapNodes`. It's possible to
		// prevent multiple steps if the visibility is checked first.
		const filteredNodes = nodes.filter(node => node.visible && node.length > 0 && node.width > 0)
		return filteredNodes.sort((a, b) => b.height - a.height)
	}

	private setLabels(sortedNodes: Node[]) {
		const appSettings = this.storeService.getState().appSettings
		const showLabelNodeName = appSettings.showMetricLabelNodeName
		const showLabelNodeMetric = appSettings.showMetricLabelNameValue

		this.codeMapLabelService.clearLabels()
		if (showLabelNodeName || showLabelNodeMetric) {
			let { amountOfTopLabels } = appSettings
			for (let index = 0; index < sortedNodes.length && amountOfTopLabels !== 0; index++) {
				if (sortedNodes[index].isLeaf) {
					//get neighbors with label
					//neighbor ==> width + margin + 1
					this.codeMapLabelService.addLabel(sortedNodes[index], {
						showNodeName: showLabelNodeName,
						showNodeMetric: showLabelNodeMetric
					})
					amountOfTopLabels -= 1
				}
			}
		}
	}

	private setArrows(sortedNodes: Node[]) {
		this.codeMapArrowService.clearArrows()
		this.codeMapArrowService.addEdgePreview(sortedNodes)
	}
}
