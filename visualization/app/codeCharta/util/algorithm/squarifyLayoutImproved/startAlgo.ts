import { CcState, CodeMapNode } from "../../../codeCharta.model"
import { OrderOption, SortingOption, squarify, SquarifyNode } from "./squarify"
import { LayoutNode } from "../layoutNode"

function convertToSquarifyNode(
    node: CodeMapNode,
    areaMetric: string,
    collapseFolders: boolean,
    depth: number,
    labelsEnabled: boolean,
    amountOfTopLabels: number
): SquarifyNode {
    if (collapseFolders && node.children && node.children.length === 1) {
        const child = node.children[0]
        if (child.children && child.children.length > 0) {
            const child_copy = { ...child }
            child_copy.name = `${node.name}/${child.name}`
            return convertToSquarifyNode(child_copy, areaMetric, collapseFolders, depth, labelsEnabled, amountOfTopLabels)
        }
    }

    const isLeaf = !node.children || node.children.length === 0

    return {
        name: node.name,
        value: node.attributes?.[areaMetric],
        originalValue: node.attributes?.[areaMetric],
        children: node.children
            ?.map(child => convertToSquarifyNode(child, areaMetric, collapseFolders, depth + 1, labelsEnabled, amountOfTopLabels))
            .filter(x => x !== null),
        rows: [],
        attributes: node.attributes,
        hasLabel: !isLeaf && depth < amountOfTopLabels && labelsEnabled
    }
}

function convertToLayoutNode(node: SquarifyNode, depth: number, parentX: number, parentY: number): LayoutNode {
    const isLeaf = !node.children || node.children.length === 0
    let layoutNode: LayoutNode
    if (node.value <= 0) {
        layoutNode = new LayoutNode(node.name, 0, 0, depth, isLeaf, node.attributes)
        layoutNode.relativeX = 0
        layoutNode.relativeY = 0
        layoutNode.updatedValue = 0
    } else {
        const width = node.x1 - node.x0
        const length = node.y1 - node.y0

        layoutNode = new LayoutNode(node.name, width, length, depth, isLeaf, node.attributes, node.hasLabel)
        layoutNode.relativeX = node.x0 - parentX
        layoutNode.relativeY = node.y0 - parentY
        layoutNode.updatedValue = node.value
    }

    if (!isLeaf) {
        layoutNode.children = node.children.map(child => convertToLayoutNode(child, depth + 1, node.x0, node.y0))
    }

    return layoutNode
}

export function generateImprovedSquarifyLayoutNodes(
    map: CodeMapNode,
    state: CcState,
    numberOfPasses: number,
    scale: boolean,
    simpleIncreaseValues: boolean,
    sortingOption: SortingOption,
    orderOption: OrderOption,
    incrementMargin: boolean,
    applySiblingMargin: boolean,
    collapseFolders: boolean,
    labelLength: number
): LayoutNode {
    const mapSizeResolutionScaling = 1
    const margin = state.dynamicSettings.margin / 4.331109347824219 / 3.9340057382606775
    const labelsEnabled = state.appSettings.enableFloorLabels
    const squarifyNode = convertToSquarifyNode(
        map,
        state.dynamicSettings.areaMetric,
        collapseFolders,
        0,
        labelsEnabled,
        state.appSettings.amountOfTopLabels
    )

    const width = Math.sqrt(squarifyNode.value) * mapSizeResolutionScaling
    squarifyNode.x0 = 0
    squarifyNode.y0 = 0
    squarifyNode.x1 = width
    squarifyNode.y1 = width

    squarify(squarifyNode, 0, false, sortingOption, OrderOption.NEW_ORDER, false, 0)

    if (numberOfPasses >= 2) {
        const marginIncrement = margin / (numberOfPasses - 1)
        let currentMargin = incrementMargin ? marginIncrement : margin
        let oldMargin = currentMargin

        if (simpleIncreaseValues) {
            increaseValuesSimple(squarifyNode, currentMargin, applySiblingMargin, 0, labelsEnabled, labelLength)
        } else {
            increaseValues(squarifyNode, currentMargin, applySiblingMargin, 0, labelsEnabled, labelLength)
        }
        squarifyNode.x1 = Math.sqrt(squarifyNode.value) * mapSizeResolutionScaling
        squarifyNode.y1 = Math.sqrt(squarifyNode.value) * mapSizeResolutionScaling
        const scaleNow = scale && numberOfPasses === 2
        squarify(squarifyNode, currentMargin, scaleNow, sortingOption, orderOption, labelsEnabled, labelLength)

        if (numberOfPasses > 2) {
            oldMargin = currentMargin
            currentMargin = incrementMargin ? currentMargin + marginIncrement : currentMargin
            updateValues(squarifyNode, currentMargin, oldMargin, applySiblingMargin, 0, labelsEnabled, labelLength)
            for (let i = 0; i < numberOfPasses - 3; i++) {
                squarify(squarifyNode, currentMargin, false, sortingOption, orderOption, labelsEnabled, labelLength)
                oldMargin = currentMargin
                currentMargin = incrementMargin ? currentMargin + marginIncrement : currentMargin
                updateValues(squarifyNode, currentMargin, oldMargin, applySiblingMargin, 0, labelsEnabled, labelLength)
            }
            squarify(squarifyNode, currentMargin, scale, sortingOption, orderOption, labelsEnabled, labelLength)
        }

        // Only apply shrinking if sibling margin is enabled
        if (applySiblingMargin) {
            shrink(squarifyNode, currentMargin)

            if (Math.abs(currentMargin - margin) > 0.0001) {
                console.warn(
                    `The margin: ${margin} and the final margin value: ${currentMargin} should be equal! (${Math.abs(currentMargin - margin)})`
                )
            }
        }
    }

    return convertToLayoutNode(squarifyNode, 0, 0, 0)
}

function updateValues(
    node: SquarifyNode,
    margin: number,
    oldMargin: number,
    applySiblingMargin: boolean,
    depth: number,
    labelsEnabled: boolean,
    labelLength: number
): number {
    if (!applySiblingMargin) {
        console.warn("applySiblingMargin needs to be tested with updateValues function")
    }
    const isLeaf = !node.children || node.children.length === 0
    const needsLabel = labelsEnabled && node.hasLabel && !isLeaf

    if (node.originalValue <= 0) {
        return 0
    }

    let childrenValueIncrease = 0
    if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            childrenValueIncrease += updateValues(child, margin, oldMargin, true, depth + 1, labelsEnabled, labelLength)
        }
    } else if (isLeaf && !applySiblingMargin) {
        return 0
    }
    const ratioChildrenValueIncrease = Math.sqrt((node.originalValue + childrenValueIncrease) / node.originalValue)
    const ratioOriginalValue = Math.sqrt((node.originalValue + childrenValueIncrease) / node.value)

    let width = (node.x1 - node.x0 - oldMargin * 2) * ratioOriginalValue
    let length = (node.y1 - node.y0 - oldMargin * 2) * ratioOriginalValue
    if (width <= 0 && length <= 0) {
        //console.warn(`Both width and length are zero or negative for node: ${node.name}, originalValue: ${node.originalValue}`)
        width = 1
        length = 1
    }
    if (width <= 0) {
        width = length / 2
        length = length / 2
    }
    if (length <= 0) {
        length = width / 2
        width = width / 2
    }

    const valueBefore = node.value
    node.value = width * length
    return node.value - valueBefore
}

function increaseValuesSimple(
    node: SquarifyNode,
    margin: number,
    applySiblingMargin: boolean,
    depth: number,
    labelsEnabled: boolean,
    labelLength: number
): number {
    if (node.value <= 0) {
        return 0
    }
    const isLeaf = !node.children || node.children.length === 0
    const needsLabel = labelsEnabled && node.hasLabel && !isLeaf

    let childrenValueIncrease = 0
    if (!isLeaf) {
        for (const child of node.children) {
            childrenValueIncrease += increaseValuesSimple(child, margin, applySiblingMargin, depth + 1, labelsEnabled, labelLength)
        }
    } else if (!applySiblingMargin && isLeaf) {
        return 0
    }
    const width = node.x1 - node.x0
    const length = node.y1 - node.y0

    // Base value increase calculation
    let valueIncrease = width * margin + length * margin + margin * margin * 2 + childrenValueIncrease

    // Add extra space for labels if needed
    if (needsLabel) {
        valueIncrease += width * labelLength
    }

    node.value += valueIncrease
    return valueIncrease
}

function increaseValues(
    node: SquarifyNode,
    margin: number,
    applySiblingMargin: boolean,
    depth: number,
    labelsEnabled: boolean,
    labelLength: number
): number {
    const isLeaf = !node.children || node.children.length === 0
    const needsLabel = labelsEnabled && node.hasLabel && !isLeaf

    if (!applySiblingMargin && isLeaf) {
        return 0
    }

    if (node.value <= 0) {
        return 0
    }

    const width = node.x1 - node.x0
    const length = node.y1 - node.y0

    if (isLeaf) {
        const valueIncrease = width * margin + length * margin + margin * margin
        node.value += valueIncrease
        return valueIncrease
    }

    let childrenValueIncrease = 0
    for (const child of node.children) {
        childrenValueIncrease += increaseValues(child, margin, applySiblingMargin, depth + 1, labelsEnabled, labelLength)
    }
    const ratioChildrenValueIncrease = (node.value + childrenValueIncrease) / node.value

    // Base value increase for non-leaf nodes
    let valueIncrease =
        Math.sqrt(ratioChildrenValueIncrease) * width * margin +
        Math.sqrt(ratioChildrenValueIncrease) * length * margin +
        margin * margin +
        childrenValueIncrease

    // Add label space if needed
    if (needsLabel) {
        valueIncrease += width * labelLength
    }

    node.value += valueIncrease
    return valueIncrease
}

function shrink(node: SquarifyNode, margin: number): void {
    node.x0 += margin / 2
    node.y0 += margin / 2
    node.x1 -= margin / 2
    node.y1 -= margin / 2

    if (node.x1 - node.x0 <= 0 || node.y1 - node.y0 <= 0) {
        node.x0 = 0
        node.y0 = 0
        node.x1 = 0
        node.y1 = 0
    }

    if (node.children) {
        for (const child of node.children) {
            shrink(child, margin)
        }
    }
}
