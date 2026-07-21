import { CodeMapNode } from "../../../model/codeCharta.model"
import { isAreaValid, isLeaf } from "../../../util/codeMapHelper"
import { formatCompactNumber } from "../../../util/formatCompactNumber"

const NO_AREA_HINT = "No Node Area for Chosen Metric"

/**
 * Everything the explorer needs to render a row beyond its name — computed as a pure function of the node
 * plus a few view-supplied facts. Each fact is optional, and an ABSENT fact turns its gate OFF: a view that
 * has no 3D map (the domain word cloud) passes `{}` and gets the trivial projection — every row selectable,
 * nothing dimmed, no decoration.
 */
export interface ExplorerRowProjection {
    /** Rows that cannot be selected ignore clicks and are rendered as inert. */
    isSelectable: boolean
    isDimmed: boolean
    isItalic: boolean
    /** The row's native hover hint ("" for none). */
    title: string
    /** Trailing column text for the row, or null to render no trailing column. */
    decoration: string | null
}

/**
 * The view-specific facts the projection reads. Metrics passes all three (its 3D-map semantics); domain
 * passes none. `buildingIds` gates selectability, `areaMetric` gates the dim/italic/title treatment, and
 * `rootUnary` gates the unary decoration — each independently.
 */
export interface ExplorerRowInputs {
    areaMetric?: string
    buildingIds?: ReadonlySet<number>
    rootUnary?: number | null
}

export function projectExplorerRow(node: CodeMapNode, inputs: ExplorerRowInputs): ExplorerRowProjection {
    const isSelectable = computeSelectable(node, inputs.buildingIds)
    const hasArea = inputs.areaMetric === undefined || isAreaValid(node, inputs.areaMetric)
    return {
        isSelectable,
        isDimmed: !hasArea,
        isItalic: !hasArea || !isSelectable,
        title: hasArea ? "" : NO_AREA_HINT,
        decoration: computeDecoration(node, inputs.rootUnary)
    }
}

// A leaf with no building cannot be selected in the scene. Folders stay clickable: they toggle open.
// With no buildings supplied (gate off) every row is selectable.
function computeSelectable(node: CodeMapNode, buildingIds: ReadonlySet<number> | undefined): boolean {
    if (buildingIds === undefined) {
        return true
    }
    return !isLeaf(node) || buildingIds.has(node.id)
}

// The unary share of the root, shown only for folders that carry a unary attribute. With no root supplied
// (gate off) there is no decoration.
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
