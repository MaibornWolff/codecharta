import { Injectable, OnDestroy } from "@angular/core"
import { Subscription, tap } from "rxjs"
import { LabelSettingsFacade } from "../../features/labelSettings/facade"
import { CcState, CodeMapNode, ColorLabelOptions, colorLabelTypes, LabelMode, LayoutAlgorithm, Node } from "../../model/codeCharta.model"
import { isDeltaState } from "../../model/files/files.helper"
import { labelsPerMapActiveSelector, nodeMetricDataSelector } from "../../renderer/renderModel/renderModel.facade"
import {
    CodeMapMesh,
    ColorCategoryCountsStore,
    createTreemapNodes,
    StreetLayoutGenerator,
    ThreeSceneService,
    ThreeStatsService
} from "../../renderer/threeViewer/threeViewer.facade"
import { FileStoreReadWindow } from "../../stores/fileStore/fileStore.facade"
import { blacklistMatcherSelector } from "../../stores/sharedView/sharedView.read.facade"
import { getTopLevelMapName } from "../../util/nodePathHelper"
import { CodeMapArrowService } from "./arrow/codeMap.arrow.service"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { RendererEngine } from "./rendererEngine.contract"
import { selectTopNByValue, selectTopNByValuePerGroup } from "./selectTopNByValue"
import { CodeMapStore } from "./stores/codeMap.store"

const MIN_BUILDING_LENGTH = 2

@Injectable({ providedIn: "root" })
export class CodeMapRenderService implements OnDestroy, RendererEngine {
    private nodesByColor = {
        positive: [],
        neutral: [],
        negative: []
    }
    private unflattenedNodes
    private subscription: Subscription

    constructor(
        private readonly codeMapStore: CodeMapStore,
        private readonly fileStoreReadWindow: FileStoreReadWindow,
        private readonly threeSceneService: ThreeSceneService,
        private readonly labelSettingsFacade: LabelSettingsFacade,
        private readonly codeMapArrowService: CodeMapArrowService,
        private readonly threeStatsService: ThreeStatsService,
        private readonly codeMapMouseEventService: CodeMapMouseEventService,
        private readonly colorCategoryCountsStore: ColorCategoryCountsStore
    ) {
        this.subscription = this.fileStoreReadWindow.isLoadingFile$.pipe(tap(this.onIsLoadingFileChanged)).subscribe()
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe()
    }

    onIsLoadingFileChanged = (isLoadingFile: boolean) => {
        if (isLoadingFile) {
            this.threeSceneService?.dispose()
        } else {
            this.threeStatsService?.resetPanels()
        }
    }

    // The RendererEngine `load` seam (Slice 14b): compose + lay out the render model. The render effect
    // calls this, then requests a frame via ThreeRendererService — the frame scheduler is the driver's
    // concern, not the engine's.
    load(model: CodeMapNode) {
        this.render(model)
        this.scaleMap()
    }

    render(map: CodeMapNode) {
        const nodes = this.getNodes(map)
        const visibleSortedNodes = this.sortVisibleNodesByHeightDescending(nodes)
        this.unflattenedNodes = visibleSortedNodes.filter(({ flat }) => !flat)

        this.setNewMapMesh(nodes, visibleSortedNodes)
        this.getNodesMatchingColorSelector(this.unflattenedNodes)
        this.setLabels(this.unflattenedNodes)
        this.setArrows(visibleSortedNodes)
    }

    private setNewMapMesh(allMeshNodes, visibleSortedNodes) {
        const state = this.codeMapStore.getState() as CcState
        const mapMesh = new CodeMapMesh(visibleSortedNodes, state, isDeltaState(state.files))
        this.threeSceneService.setMapMesh(allMeshNodes, mapMesh)
    }

    scaleMap() {
        this.codeMapMouseEventService.unhoverNode()
        this.codeMapArrowService.scale()
        this.threeSceneService.scaleHeight()
        this.labelSettingsFacade.clearLabels()
        this.setLabels(this.unflattenedNodes)
    }

    getNodes(map: CodeMapNode) {
        const state = this.codeMapStore.getState() as CcState
        const nodeMetricData = nodeMetricDataSelector(state)
        const {
            mapState: { layoutAlgorithm },
            files
        } = state
        const deltaState = isDeltaState(files)
        switch (layoutAlgorithm) {
            case LayoutAlgorithm.StreetMap:
            case LayoutAlgorithm.TreeMapStreet:
                return StreetLayoutGenerator.createStreetLayoutNodes(
                    map,
                    state,
                    nodeMetricData,
                    blacklistMatcherSelector(state),
                    deltaState
                )
            case LayoutAlgorithm.SquarifiedTreeMap:
                return createTreemapNodes(map, state, nodeMetricData, deltaState)
            default:
                return []
        }
    }

    sortVisibleNodesByHeightDescending(nodes: Node[]) {
        const experimentalFeaturesEnabled = this.codeMapStore.getState().preferences.experimentalFeaturesEnabled
        if (experimentalFeaturesEnabled) {
            this.setMinBuildingLength(nodes)
            return nodes.filter(node => node.visible && node.width > 0).sort((a, b) => b.height - a.height)
        }
        return nodes.filter(node => node.visible && node.length > 0 && node.width > 0).sort((a, b) => b.height - a.height)
    }

    private setMinBuildingLength(nodes: Node[]) {
        for (const node of nodes) {
            if (node.length <= 0) {
                node.length = MIN_BUILDING_LENGTH
            }
        }
    }

    private getNodesMatchingColorSelector(sortedNodes: Node[]) {
        const state = this.codeMapStore.getState()
        const colorRange = state.mapState.colorRange

        this.nodesByColor = {
            positive: [],
            negative: [],
            neutral: []
        }

        for (const node of sortedNodes) {
            if (node.isLeaf) {
                const metric = node.attributes[state.mapState.colorMetric]
                if (state.mapState.colorMetric === "unary") {
                    this.nodesByColor.positive.push(node)
                } else if (metric !== null) {
                    if (metric < colorRange.from) {
                        this.nodesByColor.positive.push(node)
                    } else if (metric < colorRange.to) {
                        this.nodesByColor.neutral.push(node)
                    } else {
                        this.nodesByColor.negative.push(node)
                    }
                }
            }
        }

        this.colorCategoryCountsStore.setColorCategoryCounts({
            positive: this.nodesByColor.positive.length,
            neutral: this.nodesByColor.neutral.length,
            negative: this.nodesByColor.negative.length
        })

        this.uncheckEmptyColorLabels()
    }

    private uncheckEmptyColorLabels() {
        const colorLabels = this.codeMapStore.getState().mapState.colorLabels
        const unchecks: Partial<ColorLabelOptions> = {}
        for (const category of colorLabelTypes) {
            if (colorLabels[category] && this.nodesByColor[category].length === 0) {
                unchecks[category] = false
            }
        }
        if (Object.keys(unchecks).length > 0) {
            this.codeMapStore.setColorLabels(unchecks)
        }
    }

    private setBuildingLabel(nodes: Node[], highestNodeInSet: number) {
        for (const node of nodes) {
            this.labelSettingsFacade.addLeafLabel(node, highestNodeInSet)
        }
    }

    private setLabels(sortedNodes: Node[]) {
        this.labelSettingsFacade.clearLabels()

        if (sortedNodes === undefined || sortedNodes.length === 0) {
            return
        }

        const state = this.codeMapStore.getState() as CcState
        const {
            showMetricLabelNodeName,
            showMetricLabelNameValue,
            colorLabels: colorLabelOptions,
            amountOfTopLabels,
            labelMode
        } = state.mapState

        if (showMetricLabelNodeName || showMetricLabelNameValue) {
            const highestNodeInSet = sortedNodes[0].height
            const selectTopNodes = this.getTopNodeSelector(state, amountOfTopLabels)

            if (labelMode === LabelMode.Color) {
                const { colorMetric } = state.mapState
                const selectedColorNodes = selectTopNodes(
                    colorLabelTypes
                        .filter(colorType => colorLabelOptions[colorType])
                        .flatMap(colorType => this.nodesByColor[colorType])
                        .filter(node => Number.isFinite(node.attributes[colorMetric])),
                    node => node.attributes[colorMetric]
                )
                this.setBuildingLabel(selectedColorNodes, highestNodeInSet)
            } else {
                // rank by rendered height, not the raw metric: with invertHeight or
                // direction-1 metrics the tallest buildings are not the highest values
                const nodes = selectTopNodes(
                    sortedNodes.filter(node => node.isLeaf),
                    node => node.height ?? 0
                )
                this.setBuildingLabel(nodes, highestNodeInSet)
            }
        }
    }

    private getTopNodeSelector(state: CcState, amountOfTopLabels: number) {
        if (labelsPerMapActiveSelector(state)) {
            return (nodes: Node[], getValue: (node: Node) => number) =>
                selectTopNByValuePerGroup(nodes, node => getTopLevelMapName(node.path), getValue, amountOfTopLabels)
        }
        return (nodes: Node[], getValue: (node: Node) => number) => selectTopNByValue(nodes, getValue, amountOfTopLabels)
    }

    private setArrows(sortedNodes: Node[]) {
        this.codeMapArrowService.clearArrows()
        this.codeMapArrowService.addEdgeMapBasedOnNodes(sortedNodes)
        this.codeMapArrowService.addEdgePreview()
    }
}
