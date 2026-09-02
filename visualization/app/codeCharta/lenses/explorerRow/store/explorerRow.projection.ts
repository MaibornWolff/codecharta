import { CodeMapNode, MarkedPackage } from "../../../model/codeCharta.model"
import { getMarkingColor, isAreaValid, isLeaf } from "../../../util/codeMapHelper"
import { formatCompactNumber } from "../../../util/formatCompactNumber"

const NO_AREA_HINT = "No Node Area for Chosen Metric"
const NO_DOMAIN_WORDS_HINT = "No domain words"

export interface ExplorerRowProjection {
    isSelectable: boolean
    isInactive: boolean
    isItalic: boolean
    isFlattened: boolean
    isHidden: boolean
    title: string
    decoration: string | null
    markingColor: string | null
}

export interface ExplorerRowInputs {
    areaMetric?: string
    pathsWithDomainWords?: ReadonlySet<string>
    buildingIds?: ReadonlySet<number>
    rootUnary?: number | null
    showsFlattenedState?: boolean
    hidesExcludedNodes?: boolean
    markedPackages?: MarkedPackage[]
}

export function projectExplorerRow(node: CodeMapNode, inputs: ExplorerRowInputs): ExplorerRowProjection {
    const isSelectable = computeSelectable(node, inputs.buildingIds)
    const inactiveHint = computeInactiveHint(node, inputs)
    const isInactive = inactiveHint !== ""
    return {
        isSelectable,
        isInactive,
        isItalic: isInactive || !isSelectable,
        isFlattened: Boolean(inputs.showsFlattenedState && node.isFlattened),
        isHidden: Boolean(inputs.hidesExcludedNodes && node.isExcluded),
        title: inactiveHint,
        decoration: computeDecoration(node, inputs.rootUnary),
        markingColor: computeMarkingColor(node, inputs.markedPackages)
    }
}

function computeInactiveHint(node: CodeMapNode, inputs: ExplorerRowInputs): string {
    if (inputs.areaMetric !== undefined && !isAreaValid(node, inputs.areaMetric)) {
        return NO_AREA_HINT
    }
    if (inputs.pathsWithDomainWords !== undefined && !inputs.pathsWithDomainWords.has(node.path)) {
        return NO_DOMAIN_WORDS_HINT
    }
    return ""
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

function computeMarkingColor(node: CodeMapNode, markedPackages: MarkedPackage[] | undefined): string | null {
    if (markedPackages === undefined || isLeaf(node)) {
        return null
    }
    return getMarkingColor(node, markedPackages) || null
}
