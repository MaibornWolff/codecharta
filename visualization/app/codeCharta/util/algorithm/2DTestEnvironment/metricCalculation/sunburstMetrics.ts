import { LayoutNode } from "../../layoutNode"
import { CodeMapNode } from "../../../../codeCharta.model"
import { EvaluationMetrics } from "./metricCalculator"

// Helper: recursively count nodes
function calculateTotalNumberOfNodes(node: LayoutNode | CodeMapNode): number {
    let totalCount = 1
    if (node.children) {
        for (const child of node.children) {
            totalCount += calculateTotalNumberOfNodes(child)
        }
    }
    return totalCount
}

// Helper: round
function round(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals)
    return Math.round(value * factor) / factor
}

// Helper: variance
function calculateVariance(numbers: number[]): number {
    const n = numbers.length
    if (n === 0) {
        return 0
    }
    const mean = numbers.reduce((sum, value) => sum + value, 0) / n
    const squaredDiffs = numbers.map(value => (value - mean) ** 2)
    return squaredDiffs.reduce((sum, value) => sum + value, 0) / n
}

// Calculate area differences for sunburst (area = (r2^2 - r1^2) * angle)
function calculateAreaDifferencesSunburst(
    layoutNode: LayoutNode,
    areaMetric: string
): { nodeName: string; difference: number; isLeaf: boolean }[] {
    const differences: { nodeName: string; difference: number; isLeaf: boolean }[] = []
    // Sunburst: width = angle, length = r2 - r1, relativeX = startAngle, relativeY = innerRadius
    // Area = (outerRadius^2 - innerRadius^2) * angle / 2
    const angle = layoutNode.width
    const r1 = layoutNode.relativeY
    const r2 = r1 + layoutNode.length
    const displayedArea = Math.abs(((r2 * r2 - r1 * r1) * angle) / 2)
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
            differences.push(...calculateAreaDifferencesSunburst(child, areaMetric))
        }
    }
    return differences
}

// Calculate ratios (angle/arc length to radial thickness)
function calculateRatiosSunburst(layoutNode: LayoutNode): { nodeName: string; ratio: number | undefined }[] {
    const ratios: { nodeName: string; ratio: number | undefined }[] = []
    const ratio = layoutNode.length === 0 ? undefined : layoutNode.width / layoutNode.length
    ratios.push({ nodeName: layoutNode.name, ratio })
    if (layoutNode.children) {
        for (const child of layoutNode.children) {
            ratios.push(...calculateRatiosSunburst(child))
        }
    }
    return ratios
}

// Calculate margin between arcs (angular and radial)
function calculateMarginSunburst(layoutNode: LayoutNode): { nodeName: string; margins: number[] }[] {
    const margins: { nodeName: string; margins: number[] }[] = []

    function calcNodeMargins(node: LayoutNode, parentAngle = 0, parentR1 = 0, parentR2 = 0, siblings: LayoutNode[] = [], isRoot = false) {
        if (!isRoot && node.length > 0 && node.width > 0) {
            // Angular margins (start/end angle to siblings)
            let leftMargin = node.relativeX // distance to parent's start angle
            let rightMargin = parentAngle - (node.relativeX + node.width) // distance to parent's end angle
            let innerMargin = node.relativeY - parentR1 // distance to parent's inner radius
            let outerMargin = parentR2 - (node.relativeY + node.length) // distance to parent's outer radius

            // Sibling margins (angular)
            for (const sibling of siblings) {
                if (sibling === node || sibling.length === 0 || sibling.width === 0) {
                    continue
                }
                // Sibling is before
                if (Math.abs(sibling.relativeX + sibling.width - node.relativeX) < 1e-10) {
                    leftMargin = Math.min(leftMargin, node.relativeX - (sibling.relativeX + sibling.width))
                }
                // Sibling is after
                if (Math.abs(node.relativeX + node.width - sibling.relativeX) < 1e-10) {
                    rightMargin = Math.min(rightMargin, sibling.relativeX - (node.relativeX + node.width))
                }
            }
            leftMargin = round(leftMargin, 6)
            rightMargin = round(rightMargin, 6)
            innerMargin = round(innerMargin, 6)
            outerMargin = round(outerMargin, 6)
            margins.push({ nodeName: node.name, margins: [leftMargin, rightMargin, innerMargin, outerMargin] })
        }
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                calcNodeMargins(child, node.width, node.relativeY, node.relativeY + node.length, node.children, false)
            }
        }
    }
    calcNodeMargins(layoutNode, 2 * Math.PI, 0, layoutNode.length, [], true)
    return margins
}

// Ratio of area covered by leaf arcs to total area
function calculateSpaceForLeafNodesRatioSunburst(layoutNode: LayoutNode): number {
    function leafNodeArea(node: LayoutNode): number {
        if (node.isLeaf) {
            const angle = node.width
            const r1 = node.relativeY
            const r2 = r1 + node.length
            return Math.abs(((r2 * r2 - r1 * r1) * angle) / 2)
        }
        return node.children?.reduce((sum, child) => sum + leafNodeArea(child), 0) ?? 0
    }
    const totalLeafArea = leafNodeArea(layoutNode)
    const r1 = layoutNode.relativeY
    const r2 = r1 + layoutNode.length
    const totalArea = Math.abs(((r2 * r2 - r1 * r1) * layoutNode.width) / 2)
    return totalLeafArea / totalArea
}

// Count zero-width/length/area arcs
function getNumberOfZeroAreaLayoutNodesSunburst(layoutNode: LayoutNode, areaMetric: string) {
    let numberOfZeroWidthNodes = 0
    let numberOfZeroLengthNodes = 0
    let numberOfZeroAreaNodes = 0

    function countZeroAreaNodes(node: LayoutNode) {
        if (node.width <= 0 && (node.attributes[areaMetric] ?? -1) > 0) {
            numberOfZeroWidthNodes++
        }
        if (node.length <= 0 && (node.attributes[areaMetric] ?? -1) > 0) {
            numberOfZeroLengthNodes++
        }
        if ((node.length <= 0 || node.width <= 0) && (node.attributes[areaMetric] ?? -1) > 0) {
            numberOfZeroAreaNodes++
        }
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                countZeroAreaNodes(child)
            }
        }
    }
    countZeroAreaNodes(layoutNode)
    return { numberOfZeroWidthNodes, numberOfZeroLengthNodes, numberOfZeroAreaNodes }
}

// Calculate average margin for sunburst
function calculateAimedMarginSunburst(layoutNode: LayoutNode): number {
    // Use the smallest angular or radial margin of the first-level children as a proxy
    if (!layoutNode.children || layoutNode.children.length === 0) {
        return 0
    }
    let minMargin = Number.POSITIVE_INFINITY
    for (const child of layoutNode.children) {
        minMargin = Math.min(minMargin, child.relativeX, child.relativeY)
    }
    return minMargin === Number.POSITIVE_INFINITY ? 0 : minMargin * 1000
}

// Violations: negative size, arcs outside parent, overlaps, no margin
function calculateIllegalPositioningsSunburst(layoutNode: LayoutNode) {
    interface Violation {
        type: string
        description: string
        nodes: string[]
    }
    const violations: Violation[] = []

    function checkNode(node: LayoutNode, parentNode: LayoutNode | null = null) {
        const hasArea = node.width > 0 && node.length > 0

        // Negative size
        if (node.width < 0 || node.length < 0) {
            violations.push({
                type: "negative_size",
                description: `Node "${node.name}" has negative dimensions: angle=${node.width}, radial=${node.length}`,
                nodes: [node.name]
            })
        }

        // Arc outside parent
        if (hasArea && parentNode && parentNode.width > 0 && parentNode.length > 0) {
            const isOutsideAngle = node.relativeX < 0 || node.relativeX + node.width > parentNode.width
            const isOutsideRadius =
                node.relativeY < parentNode.relativeY || node.relativeY + node.length > parentNode.relativeY + parentNode.length
            if (isOutsideAngle || isOutsideRadius) {
                violations.push({
                    type: "child_outside_parent",
                    description: `Node "${node.name}" is outside parent "${parentNode.name}" bounds`,
                    nodes: [node.name, parentNode.name]
                })
            }
        }

        // Sibling overlaps (angular)
        if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                const child1 = node.children[i]
                if (child1.width === 0 || child1.length === 0) {
                    continue
                }
                for (let j = i + 1; j < node.children.length; j++) {
                    const child2 = node.children[j]
                    if (child2.width === 0 || child2.length === 0) {
                        continue
                    }
                    // Overlap if angular intervals overlap and radial intervals overlap
                    const overlapsAngle =
                        child1.relativeX < child2.relativeX + child2.width && child1.relativeX + child1.width > child2.relativeX
                    const overlapsRadius =
                        child1.relativeY < child2.relativeY + child2.length && child1.relativeY + child1.length > child2.relativeY
                    if (overlapsAngle && overlapsRadius) {
                        violations.push({
                            type: "siblings_overlap",
                            description: `Siblings "${child1.name}" and "${child2.name}" overlap`,
                            nodes: [child1.name, child2.name]
                        })
                    }
                }
            }
            for (const child of node.children) {
                checkNode(child, node)
            }
        }
    }
    checkNode(layoutNode)
    return violations
}

export function calculateEvaluationMetricsForSunburst(
    codeMapRoot: CodeMapNode,
    layoutNode: LayoutNode,
    areaMetric: string,
    timeNeededInMs: number,
    marginValue: number
): EvaluationMetrics {
    const marginsInPixel = calculateMarginSunburst(layoutNode)
    const evaluatedAverageMargin =
        marginsInPixel.length > 0 ? marginsInPixel.reduce((a, b) => a + b.margins.reduce((x, y) => x + y, 0), 0) / marginsInPixel.length : 0
    const totalNumberOfCodeMapNodes = calculateTotalNumberOfNodes(codeMapRoot)
    const totalNumberOfLayoutNodes = calculateTotalNumberOfNodes(layoutNode)
    const missedNodes = totalNumberOfCodeMapNodes - totalNumberOfLayoutNodes
    const msPerNode = totalNumberOfLayoutNodes > 0 ? timeNeededInMs / totalNumberOfLayoutNodes : 0
    const ratios = calculateRatiosSunburst(layoutNode)
    const filteredRatios = ratios.filter(ratio => ratio.ratio !== undefined)
    const averageRatio = filteredRatios.length > 0 ? filteredRatios.reduce((a, b) => a + (b.ratio as number), 0) / filteredRatios.length : 0
    const areaDifferences = calculateAreaDifferencesSunburst(layoutNode, areaMetric)
    const varianceOfAreaDifferences = calculateVariance(areaDifferences.map(diff => diff.difference))
    const leafNodeAreaDifferences = areaDifferences.filter(diff => diff.isLeaf)
    const varianceOfLeafNodeAreaDifferences = calculateVariance(leafNodeAreaDifferences.map(diff => diff.difference))
    const { numberOfZeroWidthNodes, numberOfZeroLengthNodes, numberOfZeroAreaNodes } = getNumberOfZeroAreaLayoutNodesSunburst(
        layoutNode,
        areaMetric
    )
    const layoutNodeViolations = calculateIllegalPositioningsSunburst(layoutNode)
    const layoutNodeViolationsCount = layoutNodeViolations.reduce((acc, violation) => acc + violation.nodes.length, 0)
    const spaceForLeafNodesRatio = calculateSpaceForLeafNodesRatioSunburst(layoutNode)
    const aimedMargin = calculateAimedMarginSunburst(layoutNode)

    return {
        marginInput: marginValue,
        evaluatedAverageMargin,
        aimedRelativeMargin: aimedMargin,
        aimedAbsoluteMargin: aimedMargin,
        spaceForLeafNodesRatio,
        numberOfZeroWidthNodes,
        numberOfZeroLengthNodes,
        numberOfZeroAreaNodes,
        numberOfZeroAreaLeafNodes: -1,
        timeNeededInMs,
        totalNumberOfCodeMapNodes,
        totalNumberOfLayoutNodes,
        missedNodes,
        msPerNode,
        averageRatio,
        varianceOfAreaDifferences,
        varianceOfLeafNodeAreaDifferences,
        variationCoefficientOfAreaDifferences: null,
        layoutNodeViolationsCount,
        relativelabelLength: -1
    }
}
