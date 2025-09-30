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

// Calculate area differences for circlepacking (area = pi * r^2)
function calculateAreaDifferencesCirclePacking(
    layoutNode: LayoutNode,
    areaMetric: string
): { nodeName: string; difference: number; isLeaf: boolean }[] {
    const differences: { nodeName: string; difference: number; isLeaf: boolean }[] = []
    // Circlepacking: width = diameter, length = diameter, relativeX = centerX, relativeY = centerY
    // Area = pi * (r)^2
    const displayedArea = Math.PI * Math.pow(layoutNode.width, 2)
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
            differences.push(...calculateAreaDifferencesCirclePacking(child, areaMetric))
        }
    }
    return differences
}

// Calculate margin between circles (distance between edges)
function calculateMarginCirclePacking(layoutNode: LayoutNode): { nodeName: string; margins: number[] }[] {
    const margins: { nodeName: string; margins: number[] }[] = []

    function calcNodeMargins(node: LayoutNode, siblings: LayoutNode[] = [], isRoot = false) {
        if (!isRoot && node.width > 0 && node.length > 0) {
            // Margin to siblings: minimal distance between circle edges
            let minMargin = Number.POSITIVE_INFINITY
            const r1 = node.width
            const x1 = node.relativeX
            const y1 = node.relativeY
            for (const sibling of siblings) {
                if (sibling === node || sibling.width === 0 || sibling.length === 0) {
                    continue
                }
                const r2 = sibling.width
                const x2 = sibling.relativeX
                const y2 = sibling.relativeY
                const centerDist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
                const edgeDist = centerDist - r1 - r2
                if (edgeDist < minMargin) {
                    minMargin = edgeDist
                }
            }
            minMargin = minMargin === Number.POSITIVE_INFINITY ? 0 : round(minMargin, 6)
            margins.push({ nodeName: node.name, margins: [minMargin] })
        }
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                calcNodeMargins(child, node.children, false)
            }
        }
    }

    calcNodeMargins(layoutNode, [], true)
    return margins
}

// Ratio of area covered by leaf circles to total area
function calculateSpaceForLeafNodesRatioCirclePacking(layoutNode: LayoutNode): number {
    function leafNodeArea(node: LayoutNode): number {
        if (node.isLeaf) {
            const diameter = node.width
            return Math.PI * Math.pow(diameter / 2, 2)
        }
        return node.children?.reduce((sum, child) => sum + leafNodeArea(child), 0) ?? 0
    }

    const totalLeafArea = leafNodeArea(layoutNode)
    const diameter = layoutNode.width
    const totalArea = Math.PI * Math.pow(diameter / 2, 2)
    return totalLeafArea / totalArea
}

// Count zero-width/length/area circles
function getNumberOfZeroAreaLayoutNodesCirclePacking(layoutNode: LayoutNode, areaMetric: string) {
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

// Calculate average margin for circlepacking
function calculateAimedMarginCirclePacking(layoutNode: LayoutNode): number {
    // Use the minimal margin between root's children as a proxy
    if (!layoutNode.children || layoutNode.children.length === 0) {
        return 0
    }
    let minMargin = Number.POSITIVE_INFINITY
    for (let i = 0; i < layoutNode.children.length; i++) {
        const node1 = layoutNode.children[i]
        const r1 = node1.width / 2
        const x1 = node1.relativeX
        const y1 = node1.relativeY
        for (let j = i + 1; j < layoutNode.children.length; j++) {
            const node2 = layoutNode.children[j]
            const r2 = node2.width / 2
            const x2 = node2.relativeX
            const y2 = node2.relativeY
            const centerDist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
            const edgeDist = centerDist - r1 - r2
            if (edgeDist < minMargin) {
                minMargin = edgeDist
            }
        }
    }
    return minMargin === Number.POSITIVE_INFINITY ? 0 : minMargin * 1000
}

// Violations: negative size, circles outside parent, overlaps, no margin
function calculateIllegalPositioningsCirclePacking(layoutNode: LayoutNode) {
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
                description: `Node "${node.name}" has negative dimensions: diameter=${node.width}`,
                nodes: [node.name]
            })
        }

        // Circle outside parent
        if (hasArea && parentNode && parentNode.width > 0 && parentNode.length > 0) {
            const r = node.width / 2
            const parentR = parentNode.width / 2
            const dx = node.relativeX - parentNode.relativeX
            const dy = node.relativeY - parentNode.relativeY
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist + r > parentR + 1e-10) {
                violations.push({
                    type: "child_outside_parent",
                    description: `Node "${node.name}" is outside parent "${parentNode.name}" bounds`,
                    nodes: [node.name, parentNode.name]
                })
            }
        }

        // Sibling overlaps
        if (node.children && node.children.length > 0) {
            for (let i = 0; i < node.children.length; i++) {
                const child1 = node.children[i]
                if (child1.width === 0 || child1.length === 0) {
                    continue
                }
                const r1 = child1.width / 2
                const x1 = child1.relativeX
                const y1 = child1.relativeY
                for (let j = i + 1; j < node.children.length; j++) {
                    const child2 = node.children[j]
                    if (child2.width === 0 || child2.length === 0) {
                        continue
                    }
                    const r2 = child2.width / 2
                    const x2 = child2.relativeX
                    const y2 = child2.relativeY
                    const centerDist = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
                    if (centerDist < r1 + r2 - 1e-10) {
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

export function calculateEvaluationMetricsForCirclePacking(
    codeMapRoot: CodeMapNode,
    layoutNode: LayoutNode,
    areaMetric: string,
    timeNeededInMs: number,
    marginValue: number
): EvaluationMetrics {
    const marginsInPixel = calculateMarginCirclePacking(layoutNode)
    const evaluatedAverageMargin =
        marginsInPixel.length > 0 ? marginsInPixel.reduce((a, b) => a + b.margins.reduce((x, y) => x + y, 0), 0) / marginsInPixel.length : 0
    const totalNumberOfCodeMapNodes = calculateTotalNumberOfNodes(codeMapRoot)
    const totalNumberOfLayoutNodes = calculateTotalNumberOfNodes(layoutNode)
    const missedNodes = totalNumberOfCodeMapNodes - totalNumberOfLayoutNodes
    const msPerNode = totalNumberOfLayoutNodes > 0 ? timeNeededInMs / totalNumberOfLayoutNodes : 0
    const averageRatio = -1
    const areaDifferences = calculateAreaDifferencesCirclePacking(layoutNode, areaMetric)
    const varianceOfAreaDifferences = calculateVariance(areaDifferences.map(diff => diff.difference))
    const leafNodeAreaDifferences = areaDifferences.filter(diff => diff.isLeaf)
    const varianceOfLeafNodeAreaDifferences = calculateVariance(leafNodeAreaDifferences.map(diff => diff.difference))
    const { numberOfZeroWidthNodes, numberOfZeroLengthNodes, numberOfZeroAreaNodes } = getNumberOfZeroAreaLayoutNodesCirclePacking(
        layoutNode,
        areaMetric
    )
    const layoutNodeViolations = calculateIllegalPositioningsCirclePacking(layoutNode)
    const layoutNodeViolationsCount = layoutNodeViolations.reduce((acc, violation) => acc + violation.nodes.length, 0)
    const spaceForLeafNodesRatio = calculateSpaceForLeafNodesRatioCirclePacking(layoutNode)
    const aimedMargin = calculateAimedMarginCirclePacking(layoutNode)

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
