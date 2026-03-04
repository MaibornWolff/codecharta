import { Injectable, OnDestroy } from "@angular/core"
import { CodeMapMesh } from "./rendering/codeMapMesh"
import { createTreemapNodes } from "../../util/algorithm/treeMapLayout/treeMapGenerator"
import { LabelSettingsFacade } from "../../features/labelSettings/facade"
import { ThreeSceneService } from "./threeViewer/threeSceneService"
import { CodeMapArrowService } from "./arrow/codeMap.arrow.service"
import { CcState, CodeMapNode, ColorLabelOptions, colorLabelTypes, LabelMode, LayoutAlgorithm, Node } from "../../codeCharta.model"
import { isDeltaState } from "../../model/files/files.helper"
import { StreetLayoutGenerator } from "../../util/algorithm/streetLayout/streetLayoutGenerator"
import { ThreeStatsService } from "./threeViewer/threeStats.service"
import { CodeMapMouseEventService } from "./codeMap.mouseEvent.service"
import { isLoadingFileSelector } from "../../state/store/appSettings/isLoadingFile/isLoadingFile.selector"
import { BehaviorSubject, Subscription, tap } from "rxjs"
import { metricDataSelector } from "../../state/selectors/accumulatedData/metricData/metricData.selector"
import { State, Store } from "@ngrx/store"
import { setColorLabels } from "../../state/store/appSettings/colorLabels/colorLabels.actions"

export interface ColorCategoryCounts {
    positive: number
    neutral: number
    negative: number
}

const MIN_BUILDING_LENGTH = 2

@Injectable({ providedIn: "root" })
export class CodeMapRenderService implements OnDestroy {
    private nodesByColor = {
        positive: [],
        neutral: [],
        negative: []
    }
    private unflattenedNodes
    private subscription: Subscription
    private readonly _colorCategoryCounts$ = new BehaviorSubject<ColorCategoryCounts>({ positive: 0, neutral: 0, negative: 0 })
    readonly colorCategoryCounts$ = this._colorCategoryCounts$.asObservable()

    constructor(
        private readonly store: Store<CcState>,
        private readonly state: State<CcState>,
        private threeSceneService: ThreeSceneService,
        private labelSettingsFacade: LabelSettingsFacade,
        private codeMapArrowService: CodeMapArrowService,
        private threeStatsService: ThreeStatsService,
        private codeMapMouseEventService: CodeMapMouseEventService
    ) {
        this.subscription = this.store.select(isLoadingFileSelector).pipe(tap(this.onIsLoadingFileChanged)).subscribe()
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
        const state = this.state.getValue() as CcState
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
        const state = this.state.getValue() as CcState
        const nodeMetricData = metricDataSelector(state).nodeMetricData
        const {
            appSettings: { layoutAlgorithm },
            files
        } = state
        const deltaState = isDeltaState(files)
        switch (layoutAlgorithm) {
            case LayoutAlgorithm.StreetMap:
            case LayoutAlgorithm.TreeMapStreet:
                return StreetLayoutGenerator.createStreetLayoutNodes(map, state, nodeMetricData, deltaState)
            case LayoutAlgorithm.SquarifiedTreeMap:
                return createTreemapNodes(map, state, nodeMetricData, deltaState)
            default:
                return []
        }
    }

    sortVisibleNodesByHeightDescending(nodes: Node[]) {
        const experimentalFeaturesEnabled = this.state.getValue().appSettings.experimentalFeaturesEnabled
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
        const dynamicSettings = this.state.getValue().dynamicSettings

        this.nodesByColor = {
            positive: [],
            negative: [],
            neutral: []
        }

        for (const node of sortedNodes) {
            if (node.isLeaf) {
                const metric = node.attributes[dynamicSettings.colorMetric]
                if (dynamicSettings.colorMetric === "unary") {
                    this.nodesByColor.positive.push(node)
                } else if (metric !== null) {
                    if (metric < dynamicSettings.colorRange.from) {
                        this.nodesByColor.positive.push(node)
                    } else if (metric < dynamicSettings.colorRange.to) {
                        this.nodesByColor.neutral.push(node)
                    } else {
                        this.nodesByColor.negative.push(node)
                    }
                }
            }
        }

        this._colorCategoryCounts$.next({
            positive: this.nodesByColor.positive.length,
            neutral: this.nodesByColor.neutral.length,
            negative: this.nodesByColor.negative.length
        })

        this.uncheckEmptyColorLabels()
    }

    private uncheckEmptyColorLabels() {
        const colorLabels = this.state.getValue().appSettings.colorLabels
        const unchecks: Partial<ColorLabelOptions> = {}
        for (const category of colorLabelTypes) {
            if (colorLabels[category] && this.nodesByColor[category].length === 0) {
                unchecks[category] = false
            }
        }
        if (Object.keys(unchecks).length > 0) {
            this.store.dispatch(setColorLabels({ value: unchecks }))
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

        const {
            showMetricLabelNodeName,
            showMetricLabelNameValue,
            colorLabels: colorLabelOptions,
            amountOfTopLabels,
            labelMode
        } = this.state.getValue().appSettings

        if (showMetricLabelNodeName || showMetricLabelNameValue) {
            const highestNodeInSet = sortedNodes[0].height

            if (labelMode === LabelMode.Color) {
                const { colorMetric } = this.state.getValue().dynamicSettings
                const selectedColorNodes = colorLabelTypes
                    .filter(colorType => colorLabelOptions[colorType])
                    .flatMap(colorType => this.nodesByColor[colorType])
                    .filter(node => Number.isFinite(node.attributes[colorMetric]))
                    .sort((a, b) => b.attributes[colorMetric] - a.attributes[colorMetric])
                    .slice(0, amountOfTopLabels)
                this.setBuildingLabel(selectedColorNodes, highestNodeInSet)
            } else {
                const nodes = sortedNodes.filter(node => node.isLeaf).slice(0, amountOfTopLabels)
                this.setBuildingLabel(nodes, highestNodeInSet)
            }
        }
    }

    private setArrows(sortedNodes: Node[]) {
        this.codeMapArrowService.clearArrows()
        this.codeMapArrowService.addEdgeMapBasedOnNodes(sortedNodes)
        this.codeMapArrowService.addEdgePreview()
    }
}
