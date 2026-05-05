import { createSelector } from "@ngrx/store"
import ignore from "ignore"
import { BlacklistItem, BlacklistType, CodeMapNode } from "../../../codeCharta.model"
import { codeMapNodesSelector } from "../../../state/selectors/accumulatedData/codeMapNodes.selector"
import { searchedNodesSelector } from "../../../state/selectors/searchedNodes/searchedNodes.selector"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"
import { blacklistMatcherSelector } from "../../../state/store/fileSettings/blacklist/blacklistMatcher.selector"
import { BlacklistMatcher, isAreaValid, isLeaf, transformPath } from "../../../util/codeMapHelper"
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
    matcher: BlacklistMatcher,
    allLeaves: CodeMapNode[],
    areaMetric: string
): ExplorerCounts => {
    const matchingLeaves = searchedNodes.length > 0 ? searchedNodes.filter(node => isLeaf(node)) : allLeaves
    let flattened = 0
    let hidden = 0
    let shown = 0
    let noArea = 0
    for (const leaf of matchingLeaves) {
        const isFlat = matcher.isFlattened(leaf.path)
        const isHide = matcher.isExcluded(leaf.path)
        if (isFlat) {
            flattened++
        }
        if (isHide) {
            hidden++
        }
        if (!isFlat && !isHide) {
            shown++
            if (!isAreaValid(leaf, areaMetric)) {
                noArea++
            }
        }
    }
    return { shown, flattened, hidden, noArea }
}

export const explorerCountsSelector = createSelector(
    searchedNodesSelector,
    blacklistMatcherSelector,
    codeMapNodesSelector,
    areaMetricSelector,
    _calculateExplorerCounts
)

const buildRulesWithCount = (blacklist: BlacklistItem[], allLeaves: CodeMapNode[], type: BlacklistType): RuleWithCount[] => {
    const itemsOfType = blacklist.filter(item => item.type === type)
    if (itemsOfType.length === 0) {
        return []
    }

    const transformedLeafPaths = allLeaves.map(node => transformPath(node.path))

    const combinedEngine = ignore()
    for (const item of itemsOfType) {
        combinedEngine.add(transformPath(item.path))
    }

    const rulesWithStats = itemsOfType.map(item => ({
        item,
        engine: ignore().add(transformPath(item.path)),
        count: 0
    }))

    for (const path of transformedLeafPaths) {
        if (!combinedEngine.ignores(path)) {
            continue
        }
        for (const r of rulesWithStats) {
            if (r.engine.ignores(path)) {
                r.count++
            }
        }
    }

    return rulesWithStats
        .map(
            ({ item, count }): RuleWithCount => ({
                item,
                affectedCount: count,
                kind: isPatternRule(item.path) ? "RULE" : "MANUAL"
            })
        )
        .sort((a, b) => a.item.path.localeCompare(b.item.path))
}

export const flattenRulesWithCountSelector = createSelector(blacklistSelector, codeMapNodesSelector, (blacklist, allLeaves) =>
    buildRulesWithCount(blacklist, allLeaves, "flatten")
)

export const excludeRulesWithCountSelector = createSelector(blacklistSelector, codeMapNodesSelector, (blacklist, allLeaves) =>
    buildRulesWithCount(blacklist, allLeaves, "exclude")
)
