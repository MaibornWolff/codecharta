import { CcState, CodeMapNode, LayoutAlgorithm, NodeMetricData } from "../../../../codeCharta.model"
import { LayoutNode } from "../../layoutNode"
import { calculateDiffMetricForSquarified, calculateEvaluationMetricsForSquarifiedLayout } from "./squarifiedTreemapMetric"
import { OrderOption, SortingOption } from "../../squarifyLayoutImproved/squarify"
import { calculateEvaluationMetricsForSunburst } from "./sunburstMetrics"
import { calculateEvaluationMetricsForCirclePacking } from "./circlePackingMetrics"
import { getLayoutNodes, prepareCodeMapForLayout } from "../algo-nodeGenerator"

export interface EvaluationMetrics {
    marginInput: number
    evaluatedAverageMargin: number
    aimedRelativeMargin: number
    aimedAbsoluteMargin: number
    spaceForLeafNodesRatio: number
    numberOfZeroWidthNodes: number
    numberOfZeroLengthNodes: number
    numberOfZeroAreaNodes: number
    numberOfZeroAreaLeafNodes: number
    timeNeededInMs: number
    totalNumberOfCodeMapNodes: number
    totalNumberOfLayoutNodes: number
    missedNodes: number
    msPerNode: number
    averageRatio: number
    varianceOfAreaDifferences: number
    varianceOfLeafNodeAreaDifferences: number
    variationCoefficientOfAreaDifferences: number
    layoutNodeViolationsCount: number
    relativelabelLength: number
}

export interface DiffMetrics {
    sizeDifference: number
    leafSizeDifference: number
    positionDifference: number
    numberOfSameNodes: number
    score: number
}

export function calculateEvaluationMetrics(
    state: CcState,
    marginValue: number,
    algorithm: LayoutAlgorithm,
    codeMapNode: CodeMapNode,
    areaMetric: string,
    metricData: NodeMetricData[],
    numberOfPasses: number,
    scale: boolean,
    simpleIncreaseValues: boolean,
    sortingOption: SortingOption,
    orderOption: OrderOption, // Change keepOrder to orderOption with OrderOption enum type
    incrementMargin: boolean,
    applySiblingMargin: boolean,
    collapseFolders: boolean,
    fileFilter: string,
    enableFloorLabels: boolean,
    amountOfTopLabels: number,
    labelLength: number,
    aimedRatio: number
): EvaluationMetrics {
    state.dynamicSettings.margin = marginValue

    const startTime = performance.now()

    const preppedMap = prepareCodeMapForLayout(
        state,
        codeMapNode,
        areaMetric,
        fileFilter,
        enableFloorLabels,
        amountOfTopLabels,
        marginValue
    )

    const layoutNode = getLayoutNodes(
        state,
        codeMapNode,
        metricData,
        algorithm,
        numberOfPasses,
        scale,
        simpleIncreaseValues,
        sortingOption,
        orderOption,
        incrementMargin,
        applySiblingMargin,
        collapseFolders,
        labelLength,
        aimedRatio
    )

    const timeInMs = performance.now() - startTime

    return calculateEvaluationMetricsForLayoutNode(
        algorithm,
        codeMapNode,
        layoutNode,
        areaMetric,
        timeInMs,
        marginValue,
        applySiblingMargin
    )
}

function calculateEvaluationMetricsForLayoutNode(
    algorithm: LayoutAlgorithm,
    codeMapRoot: CodeMapNode,
    layoutNode: LayoutNode,
    areaMetric: string,
    timeNeededInMs: number,
    marginValue: number,
    applySiblingMargin: boolean
): EvaluationMetrics {
    switch (algorithm) {
        case LayoutAlgorithm.Sunburst:
            console.error("Sunburst algorithm is not supported for evaluation metrics calculation, please carefully check the results.")
            return calculateEvaluationMetricsForSunburst(codeMapRoot, layoutNode, areaMetric, timeNeededInMs, marginValue)
        case LayoutAlgorithm.CirclePacking:
            console.error(
                "Circle Packing algorithm is not supported for evaluation metrics calculation, please carefully check the results."
            )
            return calculateEvaluationMetricsForCirclePacking(codeMapRoot, layoutNode, areaMetric, timeNeededInMs, marginValue)
        case LayoutAlgorithm.StreetMap:
            console.warn("Street Map algorithm is not supported for evaluation metrics calculation.")
            return null
        default:
            return calculateEvaluationMetricsForSquarifiedLayout(
                codeMapRoot,
                layoutNode,
                areaMetric,
                timeNeededInMs,
                marginValue,
                applySiblingMargin
            )
    }
}

export function calculateDiffMetric(
    state: CcState,
    marginValue: number,
    algorithm: LayoutAlgorithm,
    codeMapNodeOne: CodeMapNode,
    codeMapNodeTwo: CodeMapNode,
    metricData: NodeMetricData[],
    numberOfPasses: number,
    scale: boolean,
    simpleIncreaseValues: boolean,
    sortingOption: SortingOption,
    orderOption: OrderOption, // Change keepOrder to orderOption with OrderOption enum type
    incrementMargin: boolean,
    applySiblingMargin: boolean,
    collapseFolders: boolean,
    fileFilter: string,
    enableFloorLabels: boolean,
    amountOfTopLabels: number,
    labelLength: number,
    aimedRatio: number
): DiffMetrics {
    state.dynamicSettings.margin = marginValue
    const areaMetric = state.dynamicSettings.areaMetric

    const preppedMapOne = prepareCodeMapForLayout(
        state,
        codeMapNodeOne,
        areaMetric,
        fileFilter,
        enableFloorLabels,
        amountOfTopLabels,
        marginValue
    )
    const preppedMapTwo = prepareCodeMapForLayout(
        state,
        codeMapNodeTwo,
        areaMetric,
        fileFilter,
        enableFloorLabels,
        amountOfTopLabels,
        marginValue
    )

    const layoutNodeOne = getLayoutNodes(
        state,
        preppedMapOne,
        metricData,
        algorithm,
        numberOfPasses,
        scale,
        simpleIncreaseValues,
        sortingOption,
        orderOption,
        incrementMargin,
        applySiblingMargin,
        collapseFolders,
        labelLength,
        aimedRatio
    )
    const layoutNodeTwo = getLayoutNodes(
        state,
        preppedMapTwo,
        metricData,
        algorithm,
        numberOfPasses,
        scale,
        simpleIncreaseValues,
        sortingOption,
        orderOption,
        incrementMargin,
        applySiblingMargin,
        collapseFolders,
        labelLength,
        aimedRatio
    )

    switch (algorithm) {
        case LayoutAlgorithm.myAlgo:
        case LayoutAlgorithm.CodeCity:
        case LayoutAlgorithm.Squarifying:
        case LayoutAlgorithm.ImprovedSquarifying:
        case LayoutAlgorithm.NestedTreemap:
            return calculateDiffMetricForSquarified(layoutNodeOne, layoutNodeTwo)
        default:
            return null
    }
}
