import { createSelector } from "@ngrx/store"
import { BlacklistItem, BlacklistType, CodeMapNode } from "../../../codeCharta.model"
import { codeMapNodesSelector } from "../../../state/selectors/accumulatedData/codeMapNodes.selector"
import { searchedNodesSelector } from "../../../state/selectors/searchedNodes/searchedNodes.selector"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"
import { isAreaValid, isLeaf, isPathBlacklisted } from "../../../util/codeMapHelper"
import { isPatternRule } from "./isPattern"

export type ExplorerCounts = {
    shown: number
    flattened: number
    hidden: number
    noArea: number
}

export type RuleWithCount = {
    item: BlacklistItem
    affectedCount: number
    kind: "RULE" | "MANUAL"
}

export const _calculateExplorerCounts = (
    searchedNodes: CodeMapNode[],
    blacklist: BlacklistItem[],
    allLeaves: CodeMapNode[],
    areaMetric: string
): ExplorerCounts => {
    const matchingLeaves = searchedNodes.length > 0 ? searchedNodes.filter(node => isLeaf(node)) : allLeaves
    let flattened = 0
    let hidden = 0
    let shown = 0
    let noArea = 0
    for (const leaf of matchingLeaves) {
        const isFlat = isPathBlacklisted(leaf.path, blacklist, "flatten")
        const isHide = isPathBlacklisted(leaf.path, blacklist, "exclude")
        if (isFlat) flattened++
        if (isHide) hidden++
        if (!isFlat && !isHide) {
            shown++
            if (!isAreaValid(leaf, areaMetric)) noArea++
        }
    }
    return { shown, flattened, hidden, noArea }
}

export const explorerCountsSelector = createSelector(
    searchedNodesSelector,
    blacklistSelector,
    codeMapNodesSelector,
    areaMetricSelector,
    _calculateExplorerCounts
)

const buildRulesWithCount = (blacklist: BlacklistItem[], allLeaves: CodeMapNode[], type: BlacklistType): RuleWithCount[] => {
    const itemsOfType = blacklist.filter(item => item.type === type)
    return itemsOfType
        .map(item => ({
            item,
            affectedCount: allLeaves.reduce((count, node) => (isPathBlacklisted(node.path, [item], type) ? count + 1 : count), 0),
            kind: (isPatternRule(item.path) ? "RULE" : "MANUAL") as "RULE" | "MANUAL"
        }))
        .sort((a, b) => a.item.path.localeCompare(b.item.path))
}

export const flattenRulesWithCountSelector = createSelector(blacklistSelector, codeMapNodesSelector, (blacklist, allLeaves) =>
    buildRulesWithCount(blacklist, allLeaves, "flatten")
)

export const excludeRulesWithCountSelector = createSelector(blacklistSelector, codeMapNodesSelector, (blacklist, allLeaves) =>
    buildRulesWithCount(blacklist, allLeaves, "exclude")
)
