import { LayoutNode } from "../../layoutNode"
import { CodeMapNode } from "../../../../codeCharta.model"
import { DiffMetrics, EvaluationMetrics } from "./metricCalculator"

function calculateAimedMargin(layoutNode: LayoutNode): number {
    const children = layoutNode.children
    const lowerLeftChild = children?.reduce((min, child) => {
        if (
            child.relativeX <= min.relativeX &&
            child.relativeY <= min.relativeY &&
            child.width > 0 &&
            child.length > 0 &&
            child.relativeX >= 0 &&
            child.relativeY >= 0
        ) {
            return child
        }
        return min
    })
    const multiplier = lowerLeftChild.isLeaf ? 2 : 1
    const relativeAimedMargin = (lowerLeftChild.relativeX / layoutNode.width) * 1000 * multiplier
    return relativeAimedMargin < 0 ? null : relativeAimedMargin
}

function calculateRelativeLabelLength(layoutNode: LayoutNode): number {
    const children = layoutNode.children
    const lowerLeftChild = children?.reduce((min, child) => {
        if (
            child.relativeX <= min.relativeX &&
            child.relativeY <= min.relativeY &&
            child.width > 0 &&
            child.length > 0 &&
            child.relativeX >= 0 &&
            child.relativeY >= 0
        ) {
            return child
        }
        return min
    })
    const relativeAimedMargin = (lowerLeftChild.relativeY / layoutNode.length) * 100
    return relativeAimedMargin < 0 ? null : relativeAimedMargin
}

function calculateAimedTotalMargin(layoutNode: LayoutNode): number {
    const children = layoutNode.children
    const lowerLeftChild = children?.reduce((min, child) => {
        if (
            child.relativeX <= min.relativeX &&
            child.relativeY <= min.relativeY &&
            child.width > 0 &&
            child.length > 0 &&
            child.relativeX >= 0 &&
            child.relativeY >= 0
        ) {
            return child
        }
        return min
    })
    return lowerLeftChild.relativeX
}

function calculateSpaceForLeafNodesRatio(layoutNode: LayoutNode): number {
    function leafNodeArea(node: LayoutNode): number {
        if (node.isLeaf) {
            return node.width * node.length
        }

        return node.children?.reduce((sum, child) => sum + leafNodeArea(child), 0)
    }

    const totalLeafArea = leafNodeArea(layoutNode)
    const totalArea = layoutNode.width * layoutNode.length

    return totalLeafArea / totalArea
}

function calculateAreaDifferences(
    layoutNode: LayoutNode,
    areaMetric: string
): {
    nodeName: string
    difference: number
    isLeaf: boolean
}[] {
    const differences: { nodeName: string; difference: number; isLeaf: boolean }[] = []
    const displayedArea = layoutNode.width * layoutNode.length
    const metricArea = layoutNode.attributes[areaMetric] ?? 0

    let differencePercentage: number

    if (metricArea === 0 && displayedArea === 0) {
        differencePercentage = 1
    } else if (metricArea === 0) {
        differencePercentage = -1
    } else if (displayedArea === 0) {
        differencePercentage = 0
    } else {
        differencePercentage = round(displayedArea / metricArea, 5)
    }

    differences.push({ nodeName: layoutNode.name, difference: differencePercentage, isLeaf: layoutNode.isLeaf })

    if (layoutNode.children) {
        for (const child of layoutNode.children) {
            differences.push(...calculateAreaDifferences(child, areaMetric))
        }
    }

    return differences
}

function calculateRatios(layoutNode: LayoutNode): { nodeName: string; ratio: number | undefined }[] {
    const ratios: { nodeName: string; ratio: number | undefined }[] = []

    const ratio = layoutNode.hasZeroWidthOrLength()
        ? undefined
        : Math.max(layoutNode.width / layoutNode.length, layoutNode.length / layoutNode.width)

    ratios.push({ nodeName: layoutNode.name, ratio })
    if (layoutNode.children) {
        for (const child of layoutNode.children) {
            ratios.push(...calculateRatios(child))
        }
    }

    return ratios
}

function calculateMargin(layoutNode: LayoutNode): { nodeName: string; margins: number[] }[] {
    const margins: { nodeName: string; margins: number[] }[] = []

    function calculateNodeMargins(node: LayoutNode, parentWidth = 0, parentLength = 0, siblings: LayoutNode[] = [], isRoot = false): void {
        // Skip adding margins for root node, but still process its children
        if (!isRoot && !node.hasZeroWidthOrLength()) {
            const rightEdge = node.relativeX + node.width
            const bottomEdge = node.relativeY + node.length

            // Initialize margins with distances to parent boundaries
            let leftMargin = node.relativeX // Distance to parent's left edge
            let rightMargin = parentWidth - (node.relativeX + node.width) // Distance to parent's right edge
            let topMargin = node.relativeY // Distance to parent's top edge
            let bottomMargin = parentLength - (node.relativeY + node.length) // Distance to parent's bottom edge

            // Check all siblings to find the closest in each direction
            for (const sibling of siblings) {
                if (sibling === node || sibling.hasZeroWidthOrLength()) {
                    continue
                }

                const siblingRightEdge = sibling.relativeX + sibling.width
                const siblingBottomEdge = sibling.relativeY + sibling.length

                const threshold = 0.00000000001 // Define a threshold for floating point comparison

                // Check if sibling is to the left
                if (
                    siblingRightEdge <= node.relativeX + threshold &&
                    !(siblingBottomEdge <= node.relativeY || sibling.relativeY >= bottomEdge)
                ) {
                    leftMargin = Math.min(leftMargin, node.relativeX - siblingRightEdge)
                }

                // Check if sibling is to the right
                if (
                    sibling.relativeX + threshold >= rightEdge &&
                    !(siblingBottomEdge <= node.relativeY || sibling.relativeY >= bottomEdge)
                ) {
                    rightMargin = Math.min(rightMargin, sibling.relativeX - rightEdge)
                }

                // Check if sibling is above
                if (
                    siblingBottomEdge <= node.relativeY + threshold &&
                    !(siblingRightEdge <= node.relativeX || sibling.relativeX >= rightEdge)
                ) {
                    topMargin = Math.min(topMargin, node.relativeY - siblingBottomEdge)
                }

                // Check if sibling is below
                if (
                    sibling.relativeY + threshold >= bottomEdge &&
                    !(siblingRightEdge <= node.relativeX || sibling.relativeX >= rightEdge)
                ) {
                    bottomMargin = Math.min(bottomMargin, sibling.relativeY - bottomEdge)
                }
            }

            //round the margins to 6 decimal places
            leftMargin = round(leftMargin, 6)
            rightMargin = round(rightMargin, 6)
            topMargin = round(topMargin, 6)
            bottomMargin = round(bottomMargin, 6)

            margins.push({ nodeName: node.name, margins: [topMargin, rightMargin, bottomMargin, leftMargin] })
        }

        // Process children recursively
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                calculateNodeMargins(child, node.width, node.length, node.children, false)
            }
        }
    }

    // Start the recursive calculation, marking the root node
    calculateNodeMargins(layoutNode, 0, 0, [], true)

    return margins
}

function getNumberOfZeroAreaLayoutNodes(layoutNode: LayoutNode, areaMetric: string) {
    let numberOfZeroWidthNodes = 0
    let numberOfZeroLengthNodes = 0
    let numberOfZeroAreaNodes = 0
    let numberOfZeroAreaLeafNodes = 0

    function countZeroAreaNodes(node: LayoutNode) {
        // Check if this node has zero width but positive area metric
        if (node.width <= 0 && (node.attributes[areaMetric] ?? -1) > 0) {
            numberOfZeroWidthNodes++
        }

        // Check if this node has zero length but positive area metric
        if (node.length <= 0 && (node.attributes[areaMetric] ?? -1) > 0) {
            numberOfZeroLengthNodes++
        }

        // Check if this node has either zero width or zero length but positive area metric
        if ((node.length <= 0 || node.width <= 0) && (node.attributes[areaMetric] ?? -1) > 0) {
            numberOfZeroAreaNodes++
            if (node.isLeaf) {
                numberOfZeroAreaLeafNodes++
            }
        }

        // Recursively process children
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                countZeroAreaNodes(child)
            }
        }
    }

    // Start recursive counting
    countZeroAreaNodes(layoutNode)

    return { numberOfZeroWidthNodes, numberOfZeroLengthNodes, numberOfZeroAreaNodes, numberOfZeroAreaLeafNodes }
}

function calculateTotalNumberOfNodes(node: LayoutNode | CodeMapNode) {
    let totalCount = 1 // Count the current node

    if (node.children) {
        for (const child of node.children) {
            totalCount += calculateTotalNumberOfNodes(child) // Recursively count children
        }
    }

    return totalCount
}

function round(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
}

function calculateVariance(numbers: number[]): number {
    const n = numbers.length
    if (n === 0) {
        return 0
    }

    const mean = numbers.reduce((sum, value) => sum + value, 0) / n
    const squaredDiffs = numbers.map(value => (value - mean) ** 2)
    const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / n

    return variance
}

function calculateIllegalPositionings(layoutNode: LayoutNode, aimedMargin: number, applySiblingMargin: boolean) {
    interface Violation {
        type: "negative_size" | "siblings_overlap" | "child_outside_parent" | "no_margin_between_children" | "no_padding_parent_child"
        description: string
        nodes: string[]
    }

    const violations: Violation[] = []

    function checkNode(node: LayoutNode, parentNode: LayoutNode | null = null) {
        // Skip nodes with no area for overlap checks, but still check their children
        const hasArea = !node.hasZeroWidthOrLength()

        // Check for negative size
        if (node.width < 0 || node.length < 0) {
            violations.push({
                type: "negative_size",
                description: `Node "${node.name}" has negative dimensions: width=${node.width}, length=${node.length}`,
                nodes: [node.name]
            })
        }

        // Check if node is outside of parent
        if (hasArea && parentNode && !parentNode.hasZeroWidthOrLength()) {
            const isOutsideParentX = node.relativeX < 0 || node.relativeX + node.width > parentNode.width
            const isOutsideParentY = node.relativeY < 0 || node.relativeY + node.length > parentNode.length

            if (isOutsideParentX || isOutsideParentY) {
                violations.push({
                    type: "child_outside_parent",
                    description: `Node "${node.name}" is outside parent "${parentNode.name}" bounds`,
                    nodes: [node.name, parentNode.name]
                })
            }
        }

        // Check for padding between parent and children
        if (hasArea && parentNode && !parentNode.hasZeroWidthOrLength()) {
            const paddingLeft = node.relativeX
            const paddingTop = node.relativeY
            const paddingRight = parentNode.width - (node.relativeX + node.width)
            const paddingBottom = parentNode.length - (node.relativeY + node.length)

            // Consider padding to be missing if it's exactly zero (using a small epsilon for floating point comparisons)
            const epsilon = 1e-10
            if (paddingLeft < epsilon || paddingRight < epsilon || paddingTop < epsilon || paddingBottom < epsilon) {
                violations.push({
                    type: "no_padding_parent_child",
                    description: `No padding between parent "${parentNode.name}" and child "${node.name}"`,
                    nodes: [node.name, parentNode.name]
                })
            }
        }

        // Check sibling overlaps and margins between siblings
        if (node.children && node.children.length > 0) {
            // Check sibling overlaps
            for (let i = 0; i < node.children.length; i++) {
                const child1 = node.children[i]
                if (child1.hasZeroWidthOrLength()) {
                    continue
                }

                // Check each pair of siblings for overlap
                for (let j = i + 1; j < node.children.length; j++) {
                    const child2 = node.children[j]
                    if (child2.hasZeroWidthOrLength()) {
                        continue
                    }

                    const xSpaceChild1Left = child2.relativeX - child1.relativeX - child1.width
                    const xSpaceChild2Left = child1.relativeX - child2.relativeX - child2.width
                    const ySpaceChild1Top = child2.relativeY - child1.relativeY - child1.length
                    const ySpaceChild2Top = child1.relativeY - child2.relativeY - child2.length

                    const epsilon = 1e-10 // Small value for floating point comparison

                    const overlapsX = -epsilon > xSpaceChild1Left && -epsilon > xSpaceChild2Left
                    const overlapsY = -epsilon > ySpaceChild1Top && -epsilon > ySpaceChild2Top

                    if (overlapsX && overlapsY) {
                        violations.push({
                            type: "siblings_overlap",
                            description: `Siblings "${child1.name}" and "${child2.name}" overlap: xSpaceChild1Left=${xSpaceChild1Left}, xSpaceChild2Left=${xSpaceChild2Left}, ySpaceChild1Top=${ySpaceChild1Top}, ySpaceChild2Top=${ySpaceChild2Top}`,
                            nodes: [child1.name, child2.name]
                        })
                    } else if (
                        applySiblingMargin &&
                        ((overlapsY && Math.min(Math.abs(xSpaceChild1Left), Math.abs(xSpaceChild2Left)) < aimedMargin * 0.9) ||
                            (overlapsX && Math.min(Math.abs(ySpaceChild1Top), Math.abs(ySpaceChild2Top)) < aimedMargin * 0.9))
                    ) {
                        violations.push({
                            type: "no_margin_between_children",
                            description: `No margin between siblings "${child1.name}" and "${child2.name}"`,
                            nodes: [child1.name, child2.name]
                        })
                    }
                }
            }

            // Recursively check all children
            for (const child of node.children) {
                checkNode(child, node)
            }
        }
    }

    // Start recursive check from the root node
    checkNode(layoutNode)
    return violations
}

export function calculateEvaluationMetricsForSquarifiedLayout(
    codeMapRoot: CodeMapNode,
    layoutNode: LayoutNode,
    areaMetric: string,
    timeNeededInMs: number,
    marginValue: number,
    applySiblingMargin: boolean
): EvaluationMetrics {
    const marginsInPixel = calculateMargin(layoutNode)
    const evaluatedAverageMargin =
        marginsInPixel.length > 0 ? marginsInPixel.reduce((a, b) => a + b.margins.reduce((x, y) => x + y, 0), 0) / marginsInPixel.length : 0
    const totalNumberOfCodeMapNodes = calculateTotalNumberOfNodes(codeMapRoot)
    const totalNumberOfLayoutNodes = calculateTotalNumberOfNodes(layoutNode)
    const missedNodes = totalNumberOfCodeMapNodes - totalNumberOfLayoutNodes
    const msPerNode = totalNumberOfLayoutNodes > 0 ? timeNeededInMs / totalNumberOfLayoutNodes : 0
    const ratios = calculateRatios(layoutNode)
    const filteredRatios = ratios.filter(ratio => ratio.ratio !== undefined)
    const averageRatio = filteredRatios.length > 0 ? filteredRatios.reduce((a, b) => a + (b.ratio as number), 0) / filteredRatios.length : 0
    const areaDifferences = calculateAreaDifferences(layoutNode, areaMetric)
    const varianceOfAreaDifferences = calculateVariance(areaDifferences.map(diff => diff.difference))
    const meanOfAreaDifferences = areaDifferences.reduce((a, b) => a + b.difference, 0) / areaDifferences.length
    const variationCoefficientOfAreaDifferences = Math.sqrt(varianceOfAreaDifferences) / meanOfAreaDifferences
    const leafNodeAreaDifferences = areaDifferences.filter(diff => diff.isLeaf)
    const varianceOfLeafNodeAreaDifferences = calculateVariance(leafNodeAreaDifferences.map(diff => diff.difference))
    const { numberOfZeroWidthNodes, numberOfZeroLengthNodes, numberOfZeroAreaNodes, numberOfZeroAreaLeafNodes } =
        getNumberOfZeroAreaLayoutNodes(layoutNode, areaMetric)
    const aimedRelativeMargin = calculateAimedMargin(layoutNode)
    const aimedAbsoluteMargin = calculateAimedTotalMargin(layoutNode)
    const layoutNodeViolations = calculateIllegalPositionings(layoutNode, aimedAbsoluteMargin, applySiblingMargin)
    const layoutNodeViolationsCount = layoutNodeViolations.reduce((acc, violation) => acc + violation.nodes.length, 0)
    const spaceForLeafNodesRatio = calculateSpaceForLeafNodesRatio(layoutNode)
    const relativelabelLength = calculateRelativeLabelLength(layoutNode)

    return {
        marginInput: marginValue,
        evaluatedAverageMargin,
        aimedRelativeMargin,
        aimedAbsoluteMargin,
        spaceForLeafNodesRatio,
        numberOfZeroWidthNodes,
        numberOfZeroLengthNodes,
        numberOfZeroAreaNodes,
        numberOfZeroAreaLeafNodes,
        timeNeededInMs,
        totalNumberOfCodeMapNodes,
        totalNumberOfLayoutNodes,
        missedNodes,
        msPerNode,
        averageRatio,
        varianceOfAreaDifferences,
        varianceOfLeafNodeAreaDifferences,
        variationCoefficientOfAreaDifferences,
        layoutNodeViolationsCount,
        relativelabelLength
    }
}

function calculatePositionDifference(
    layoutNodeOne: LayoutNode,
    layoutNodeTwo: LayoutNode
): { positionDifference: number; sizeDifference: number; leafSizeDifference: number; numberOfSameNodes: number } {
    let positionDifference = 0
    let sizeDifference = 0
    let numberOfSameNodes = 0
    let leafSizeDifference = 0

    if (layoutNodeOne.name !== layoutNodeTwo.name) {
        throw new Error(`Layout nodes do not match: ${layoutNodeOne.name} vs ${layoutNodeTwo.name}`)
    }

    function compareNodes(nodeOne: LayoutNode, nodeTwo: LayoutNode) {
        if (nodeOne.relativeX !== nodeTwo.relativeX || nodeOne.relativeY !== nodeTwo.relativeY) {
            positionDifference += Math.abs(nodeOne.relativeX - nodeTwo.relativeX) + Math.abs(nodeOne.relativeY - nodeTwo.relativeY)
            const tempSizeDifference = Math.abs(nodeOne.width - nodeTwo.width) + Math.abs(nodeOne.length - nodeTwo.length)
            sizeDifference += tempSizeDifference
            if (nodeOne.isLeaf && nodeTwo.isLeaf) {
                leafSizeDifference += tempSizeDifference
            }
        }

        if (nodeOne.children && nodeTwo.children) {
            nodeOne.children.forEach((childOne, index) => {
                const childTwo = nodeTwo.children.find(childTwo => childTwo.name === childOne.name)
                if (childTwo) {
                    numberOfSameNodes++
                    compareNodes(childOne, childTwo)
                }
            })
        }
    }

    compareNodes(layoutNodeOne, layoutNodeTwo)

    return { positionDifference, sizeDifference, leafSizeDifference, numberOfSameNodes }
}

export function calculateDiffMetricForSquarified(layoutNodeOne: LayoutNode, layoutNodeTwo: LayoutNode): DiffMetrics {
    const { positionDifference, sizeDifference, leafSizeDifference, numberOfSameNodes } = calculatePositionDifference(
        layoutNodeOne,
        layoutNodeTwo
    )
    const score = sizeDifference + leafSizeDifference + positionDifference

    return {
        sizeDifference,
        leafSizeDifference,
        positionDifference,
        numberOfSameNodes,
        score
    }
}
