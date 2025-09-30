import { CcState, CodeMapNode } from "../../../codeCharta.model"
import { getMapResolutionScaleFactor } from "../../codeMapHelper"
import { LayoutNode } from "../layoutNode"

export function generateCodeCity(codeMapNode: CodeMapNode, state: CcState): LayoutNode {
    const areaMetric = state.dynamicSettings.areaMetric
    const margin = state.dynamicSettings.margin / 3.082277563254639 / 2.797537913541262
    const mapSizeResolutionScaling = getMapResolutionScaleFactor(state.files)

    const layoutNode = generateLayout(codeMapNode, areaMetric, margin, 0)
    scaleLayoutNode(layoutNode, mapSizeResolutionScaling)
    return layoutNode
}

function scaleLayoutNode(layoutNode: LayoutNode, scaling: number) {
    layoutNode.relativeX *= scaling
    layoutNode.relativeY *= scaling
    layoutNode.width *= scaling
    layoutNode.length *= scaling

    if (!layoutNode.isLeaf) {
        for (const child of layoutNode.children) {
            scaleLayoutNode(child, scaling)
        }
    }
}

function generateLayout(codeMapNode: CodeMapNode, areaMetric: string, margin: number, depth: number): LayoutNode {
    const isLeaf = codeMapNode.children ? codeMapNode.children.length === 0 : true

    if (isLeaf) {
        const hasAreaMetricValue = codeMapNode.attributes[areaMetric] !== undefined
        const side = hasAreaMetricValue ? Math.sqrt(codeMapNode.attributes[areaMetric]) : 0
        return new LayoutNode(codeMapNode.name, side, side, depth, true, codeMapNode.attributes)
    }

    const children: LayoutNode[] = []
    for (const child of codeMapNode.children) {
        children.push(generateLayout(child, areaMetric, margin, depth + 1))
    }

    let totalChildArea = 0
    for (const child of children) {
        totalChildArea += child.attributes[areaMetric]
    }
    const nodeAreaValue = codeMapNode.attributes[areaMetric]
    if (nodeAreaValue && nodeAreaValue !== totalChildArea) {
        throw new Error(
            `Area metric value of ${codeMapNode.name} (${nodeAreaValue}) does not match the sum of its children's area metric values (${totalChildArea})`
        )
    }
    const layoutNodeAttributes = { ...codeMapNode.attributes, areaMetric: totalChildArea }

    const side = packLayoutNode(children, margin)

    const layoutNode = new LayoutNode(codeMapNode.name, side, side, depth, false, layoutNodeAttributes)
    layoutNode.children = children
    return layoutNode
}

function finallyPlaceNode(
    node: LayoutNode,
    feasiblePositions: Set<{ x: number; y: number }>,
    feasiblePosition: { x: number; y: number },
    padding: number,
    currentParentSide: number
) {
    const { x, y } = feasiblePosition
    node.relativeX = x
    node.relativeY = y
    feasiblePositions.delete(feasiblePosition)
    feasiblePositions.add({ x: x + node.width + padding, y })
    feasiblePositions.add({ x, y: y + node.length + padding })
    return Math.max(x + node.width + padding, y + node.length + padding, currentParentSide)
}

function nodeIsNotPlaceable(node: LayoutNode, placedNodes: LayoutNode[], margin: number): boolean {
    const nodeX = node.relativeX
    const nodeY = node.relativeY

    for (const placedNode of placedNodes) {
        if (
            !(
                nodeX + node.width + margin <= placedNode.relativeX ||
                placedNode.relativeX + placedNode.width + margin <= nodeX ||
                nodeY + node.length + margin <= placedNode.relativeY ||
                placedNode.relativeY + placedNode.length + margin <= nodeY
            )
        ) {
            return true
        }
    }

    return false
}

function placeNode(
    feasiblePositions: Set<{ x: number; y: number }>,
    node: LayoutNode,
    currentParentSide: number,
    padding: number,
    placedNodes: LayoutNode[]
): number {
    let bestPosition = null
    let bestSideIncrease = Number.POSITIVE_INFINITY

    for (const feasiblePosition of feasiblePositions) {
        const { x, y } = feasiblePosition

        // Store original position to temporarily place the node
        const originalX = node.relativeX
        const originalY = node.relativeY

        // Temporarily place the node at this position for intersection check
        node.relativeX = x
        node.relativeY = y

        // If there's an intersection, skip this position
        if (nodeIsNotPlaceable(node, placedNodes, padding)) {
            // Restore original position and continue
            node.relativeX = originalX
            node.relativeY = originalY
            continue
        }

        // Restore original position
        node.relativeX = originalX
        node.relativeY = originalY

        const xEnd = x + node.width
        const yEnd = y + node.length

        if (xEnd <= currentParentSide - padding && yEnd <= currentParentSide - padding) {
            placedNodes.push(node)
            return finallyPlaceNode(node, feasiblePositions, feasiblePosition, padding, currentParentSide)
        }

        const xSideIncrease = xEnd - currentParentSide
        const ySideIncrease = yEnd - currentParentSide
        const sideIncrease = Math.max(xSideIncrease, ySideIncrease)

        if (sideIncrease < bestSideIncrease) {
            bestSideIncrease = sideIncrease
            bestPosition = feasiblePosition
        }
    }

    if (bestPosition) {
        placedNodes.push(node)
    }

    return finallyPlaceNode(node, feasiblePositions, bestPosition, padding, currentParentSide)
}

function packLayoutNode(children: LayoutNode[], padding: number): number {
    if (!children || children.length === 0) {
        return 0
    }

    const sortedChildren = [...children].sort((a, b) => b.width - a.width)
    let currentParentSide = padding * 2

    const feasiblePositions: Set<{ x: number; y: number }> = new Set()
    feasiblePositions.add({ x: padding, y: padding })

    // Track placed nodes to check for intersections
    const placedNodes: LayoutNode[] = []

    for (const child of sortedChildren) {
        currentParentSide = placeNode(feasiblePositions, child, currentParentSide, padding, placedNodes)
    }

    return currentParentSide
}
