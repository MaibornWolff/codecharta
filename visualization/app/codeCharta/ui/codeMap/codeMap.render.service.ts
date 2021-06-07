"use strict"

import { CodeMapMesh } from "./rendering/codeMapMesh"
import { createTreemapNodes } from "../../util/algorithm/treeMapLayout/treeMapGenerator"
import { CodeMapLabelService } from "./codeMap.label.service"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapArrowService } from "./codeMap.arrow.service"
import {CodeMapNode, LayoutAlgorithm, Node} from "../../codeCharta.model"
import { StoreService } from "../../state/store.service"
import { isDeltaState } from "../../model/files/files.helper"
import { StreetLayoutGenerator } from "../../util/algorithm/streetLayout/streetLayoutGenerator"
import { IsLoadingFileService, IsLoadingFileSubscriber } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.service"
import { IRootScopeService } from "angular"
import { ThreeStatsService } from "./threeViewer/threeStatsService"
import { ThreeUpdateCycleService } from "./threeViewer/threeUpdateCycleService"

export class CodeMapRenderService implements IsLoadingFileSubscriber {

	private nodesByColor = {
		positive: [],
		neutral: [],
		negative: []
	}

	constructor(
		private $rootScope: IRootScopeService,
		private storeService: StoreService,
		private threeSceneService: ThreeSceneService,
		private codeMapLabelService: CodeMapLabelService,
		private codeMapArrowService: CodeMapArrowService,
		private threeStatsService: ThreeStatsService,
		private threeUpdateCycleService: ThreeUpdateCycleService
	) {
		IsLoadingFileService.subscribe(this.$rootScope, this)
	}
	onIsLoadingFileChanged(isLoadingFile: boolean) {
		if (isLoadingFile) {
			this.threeSceneService?.dispose()
		} else {
			this.threeStatsService?.resetPanels()
		}
	}

	update() {
			this.threeUpdateCycleService.update()
	}

	render(map: CodeMapNode) {
		const sortedNodes = this.getSortedNodes(map)
		this.setNewMapMesh(sortedNodes)
		this.setLabels(sortedNodes.filter(({ flat }) => !flat))
		this.getNodesMatchingColorSelector(sortedNodes.filter(({ flat }) => !flat))
		console.log(this.nodesByColor)
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
			metricData: { nodeMetricData },
			files
		} = state
		let nodes: Node[] = []
		const deltaState = isDeltaState(files)
		switch (layoutAlgorithm) {
			case LayoutAlgorithm.StreetMap:
			case LayoutAlgorithm.TreeMapStreet:
				nodes = StreetLayoutGenerator.createStreetLayoutNodes(map, state, nodeMetricData, deltaState)
				break
			case LayoutAlgorithm.SquarifiedTreeMap:
				nodes = createTreemapNodes(map, state, nodeMetricData, deltaState)
				break
		}
		// TODO: Move the filtering step into `createTreemapNodes`. It's possible to
		// prevent multiple steps if the visibility is checked first.
		return nodes.filter(node => node.visible && node.length > 0 && node.width > 0).sort((a, b) => b.height - a.height)
	}

	private getNodesMatchingColorSelector(sortedNodes: Node[]) {
		const mapColor = this.storeService.getState().appSettings.mapColors

		this.nodesByColor = {
			positive: [],
			negative: [],
			neutral: []
		}


		for(const node of sortedNodes){
			if(node.isLeaf) {
				switch (node.color) {
					case mapColor.negative:
						this.nodesByColor.negative.push(node)
						break

					case mapColor.positive:
							this.nodesByColor.positive.push(node)
						break

					case mapColor.neutral:
						this.nodesByColor.neutral.push(node)
						break
				}
			}

		}

	}


	private setLabels(sortedNodes: Node[]) {
		const appSettings = this.storeService.getState().appSettings
		const showLabelNodeName = appSettings.showMetricLabelNodeName
		const showLabelNodeMetric = appSettings.showMetricLabelNameValue

		this.codeMapLabelService.clearLabels()


		/**
		 *  color Nodes besorgen
		 *  umsortieren nach Farbe
		 *  amountOfTopLabels = Anzahl der Elemente mit Farbe x
		 *  Fallunterscheidung: HöhenLabel/ Farblabel
		 *
		 * */

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
