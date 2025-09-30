import { CcState, CodeMapNode, LayoutAlgorithm, NameDataPair, Node, NodeMetricData } from "../../../codeCharta.model"
import { ExportCCFile } from "../../../codeCharta.api.model"
import { getCCFile, getCCFileAndDecorateFileChecksum } from "../../fileHelper"
import { NodeDecorator } from "../../nodeDecorator"
import { FileSelectionState } from "../../../model/files/files"
import { calculateNodeMetricData } from "../../../state/selectors/accumulatedData/metricData/nodeMetricData.calculator"
import * as SquarifiedLayoutGenerator from "../treeMapLayout/treeMapGenerator"
import { StreetLayoutGenerator } from "../streetLayout/streetLayoutGenerator"
import { createMyAlgo } from "../myAlgo/myAlgo"
import { generateNested } from "../nestedTreeMapLayout/nestedAlgo"
import { generateCodeCity } from "../codeCityAlgo/codeCityAlgo"
import { generateSquarifyLayoutNodes } from "../squarifyLayout/startAlgo"
import { generateImprovedSquarifyLayoutNodes } from "../squarifyLayoutImproved/startAlgo"
import { OrderOption, SortingOption } from "../squarifyLayoutImproved/squarify"
import { generateSunburstDiagram } from "../sunburst/sunburst"
import { generateCirclePacking } from "../circlePacking/pack"
import { LayoutNode } from "../layoutNode"

export function generateCCFileAndMetricData(state: CcState, rawFileContent: string, fileSize: number) {
    const exportCcFile: ExportCCFile = getCCFileAndDecorateFileChecksum(rawFileContent)
    if (!exportCcFile) {
        throw new Error("Error reading file content")
    }
    const ccNameDataPair: NameDataPair = {
        fileName: exportCcFile.projectName,
        fileSize,
        content: exportCcFile
    }

    const ccFile = getCCFile(ccNameDataPair)
    NodeDecorator.decorateMapWithPathAttribute(ccFile)
    const fileStates = [{ file: ccFile, selectedAs: FileSelectionState.Partial }]
    state.files = fileStates

    const metricData = calculateNodeMetricData(fileStates, [])

    return {
        ccFile,
        metricData
    }
}

export function addUnaryMetric(map: CodeMapNode) {
    map.attributes["unary"] = 50
    if (map.children !== undefined) {
        for (const child of map.children) {
            addUnaryMetric(child)
        }
    }
}

/**
 * Converts a filter string like "*.js, *.jsx" to an array of regexes.
 */
function parseFilterString(filter: string): RegExp[] {
    if (!filter) {
        return []
    }
    return filter
        .split(",")
        .map(f => f.trim())
        .filter(Boolean)
        .map(pattern => {
            // Escape regex special chars except * and ?
            let regexStr = pattern.replace(/[-\/\\^$+?.()|[\]{}]/g, "\\$&")
            regexStr = regexStr.replace(/\*/g, ".*").replace(/\?/g, ".")
            return new RegExp(`^${regexStr}$`, "i")
        })
}

/**
 * Recursively filters the tree, keeping only files matching the regexes.
 * Removes folders that become empty after filtering.
 */
function filterTreeByFileName(node: CodeMapNode, regexes: RegExp[]): CodeMapNode | null {
    if (!node.children || node.children.length === 0) {
        // Leaf node (file)
        if (regexes.length === 0) {
            return node // No filter, keep all
        }
        return regexes.some(r => r.test(node.name)) ? node : null
    }
    // Folder node
    const filteredChildren = node.children
        .map(child => filterTreeByFileName(child, regexes))
        .filter(child => child !== null) as CodeMapNode[]
    if (filteredChildren.length === 0) {
        return null
    }
    return {
        ...node,
        children: filteredChildren
    }
}

export function prepareCodeMapForLayout(
    state: CcState,
    map: CodeMapNode,
    areaMetric: string,
    filter: string,
    enableFloorLabels: boolean,
    amountOfTopLabels: number,
    margin: number
): CodeMapNode {
    state.dynamicSettings.focusedNodePath = []
    state.appSettings.enableFloorLabels = enableFloorLabels
    state.appSettings.amountOfTopLabels = amountOfTopLabels
    state.appSettings.experimentalFeaturesEnabled = false
    state.dynamicSettings.margin = margin
    state.dynamicSettings.areaMetric = areaMetric
    state.dynamicSettings.heightMetric = areaMetric

    let filteredMap = map
    if (filter && filter.trim().length > 0) {
        const regexes = parseFilterString(filter)
        const filtered = filterTreeByFileName(map, regexes)
        if (filtered) {
            filteredMap = filtered
        } else {
            // If nothing matches, create an empty root node
            filteredMap = { ...map, children: [] }
        }
    }

    translateAttributesToTop(filteredMap, areaMetric)
    addUnaryMetric(filteredMap)

    return filteredMap
}

export function generateNodes(
    state: CcState,
    map: CodeMapNode,
    metricData: NodeMetricData[],
    areaMetric: string,
    margin: number,
    layoutAlgorithm: LayoutAlgorithm,
    enableFloorLabels: boolean,
    amountOfTopLabels: number,
    numberOfPasses: number,
    scale: boolean,
    simpleIncreaseValues: boolean,
    sortingOption: SortingOption,
    orderOption: OrderOption,
    incrementMargin: boolean,
    applySiblingMargin: boolean,
    collapseFolders: boolean,
    filter: string,
    labelLength: number,
    aimedRatio: number
) {
    const preppedMap = prepareCodeMapForLayout(state, map, areaMetric, filter, enableFloorLabels, amountOfTopLabels, margin)

    switch (layoutAlgorithm) {
        case LayoutAlgorithm.StreetMap:
        case LayoutAlgorithm.TreeMapStreet:
            return StreetLayoutGenerator.createStreetLayoutNodes(preppedMap, state, metricData, false)
        case LayoutAlgorithm.SquarifiedTreeMap:
            return SquarifiedLayoutGenerator.createTreemapNodes(preppedMap, state, metricData, false)
        default:
            return getLayoutNodes(
                state,
                preppedMap,
                metricData,
                layoutAlgorithm,
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
            ).toNodeArray()
    }
}

export function translateAttributesToTop(node: CodeMapNode, areaMetric: string): void {
    const children = node.children
    if (children !== undefined) {
        for (const child of children) {
            translateAttributesToTop(child, areaMetric)
        }
    }

    const ownValue = node.attributes?.[areaMetric]

    if (children === undefined || children?.length === 0) {
        if (ownValue === undefined) {
            node.attributes[areaMetric] = 0
        }
    } else {
        const childValue = children.reduce((sum, child) => sum + (child.attributes[areaMetric] || 0), 0)

        if (ownValue && childValue !== ownValue) {
            console.warn("Node value does not match the sum of its children's values", node.name, ownValue, childValue)
        }

        if (ownValue === undefined) {
            node.attributes[areaMetric] = childValue
        }
    }
}

export function getLayoutNodes(
    state: CcState,
    map: CodeMapNode,
    metricData: NodeMetricData[],
    layoutAlgorithm: LayoutAlgorithm,
    numberOfPasses: number,
    scale: boolean,
    simpleIncreaseValues: boolean,
    sortingOption: SortingOption,
    orderOption: OrderOption,
    incrementMargin: boolean,
    applySiblingMargin: boolean,
    collapseFolders: boolean,
    labelLength: number,
    aimedRatio: number
): LayoutNode {
    switch (layoutAlgorithm) {
        case LayoutAlgorithm.myAlgo:
            return createMyAlgo(map, state, metricData)
        case LayoutAlgorithm.NestedTreemap:
            return generateNested(map, state, metricData)
        case LayoutAlgorithm.CodeCity:
            return generateCodeCity(map, state)
        case LayoutAlgorithm.Squarifying:
            return generateSquarifyLayoutNodes(map, state, aimedRatio)
        case LayoutAlgorithm.ImprovedSquarifying:
            return generateImprovedSquarifyLayoutNodes(
                map,
                state,
                numberOfPasses,
                scale,
                simpleIncreaseValues,
                sortingOption,
                orderOption,
                incrementMargin,
                applySiblingMargin,
                collapseFolders,
                labelLength
            )
        case LayoutAlgorithm.Sunburst:
            return generateSunburstDiagram(map, state, sortingOption)
        case LayoutAlgorithm.CirclePacking:
            return generateCirclePacking(map, state)
        default:
            return undefined
    }
}

export function getNumberOfZeroAreaNodes(nodes: Node[], areaMetric: string) {
    const numberOfZeroWidthNodes = nodes.filter(node => node.width <= 0 && (node.attributes[areaMetric] ?? -1 > 0)).length
    const numberOfZeroLengthNodes = nodes.filter(node => node.length <= 0 && (node.attributes[areaMetric] ?? -1 > 0)).length
    const numberOfZeroAreaNodes = nodes.filter(
        node => (node.width <= 0 || node.length <= 0) && (node.attributes[areaMetric] ?? -1 > 0)
    ).length
    return { numberOfZeroWidthNodes, numberOfZeroLengthNodes, numberOfZeroAreaNodes }
}
