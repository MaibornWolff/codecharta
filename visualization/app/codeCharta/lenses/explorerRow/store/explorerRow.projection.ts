import { CodeMapNode } from "../../../model/codeCharta.model"
import { isAreaValid, isLeaf } from "../../../util/codeMapHelper"
import { formatCompactNumber } from "../../../util/formatCompactNumber"

const NO_AREA_HINT = "No Node Area for Chosen Metric"

export interface ExplorerRowProjection {
    isSelectable: boolean
    isInactive: boolean
    isItalic: boolean
    isFlattened: boolean
    title: string
    decoration: string | null
}

export interface ExplorerRowInputs {
    areaMetric?: string
    buildingIds?: ReadonlySet<number>
    rootUnary?: number | null
    showsFlattenedState?: boolean
}

export function projectExplorerRow(node: CodeMapNode, inputs: ExplorerRowInputs): ExplorerRowProjection {
    const isSelectable = computeSelectable(node, inputs.buildingIds)
    const hasArea = inputs.areaMetric === undefined || isAreaValid(node, inputs.areaMetric)
    return {
        isSelectable,
        isInactive: !hasArea,
        isItalic: !hasArea || !isSelectable,
        isFlattened: Boolean(inputs.showsFlattenedState && node.isFlattened),
        title: hasArea ? "" : NO_AREA_HINT,
        decoration: computeDecoration(node, inputs.rootUnary)
    }
}

function computeSelectable(node: CodeMapNode, buildingIds: ReadonlySet<number> | undefined): boolean {
    if (buildingIds === undefined) {
        return true
    }
    return !isLeaf(node) || buildingIds.has(node.id)
}

function computeDecoration(node: CodeMapNode, rootUnary: number | null | undefined): string | null {
    if (rootUnary === undefined) {
        return null
    }
    const unary = node.attributes.unary
    if (isLeaf(node) || unary == null) {
        return null
    }
    const percentage = rootUnary ? Math.round((100 * unary) / rootUnary) : 0
    return `${percentage}% / ${formatCompactNumber(unary)}`
}
