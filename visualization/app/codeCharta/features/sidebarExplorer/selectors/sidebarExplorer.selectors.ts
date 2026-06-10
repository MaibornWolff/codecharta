import { createSelector } from "@ngrx/store"
import ignore from "ignore"
import { BlacklistItem, BlacklistType, CodeMapNode } from "../../../codeCharta.model"
import { codeMapNodesSelector } from "../../../state/selectors/accumulatedData/codeMapNodes.selector"
import { searchedNodesSelector } from "../../../state/selectors/searchedNodes/searchedNodes.selector"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"
import { blacklistMatcherSelector } from "../../../state/store/fileSettings/blacklist/blacklistMatcher.selector"
import { addRulePatternsToEngine, BlacklistMatcher, isAreaValid, isLeaf, returnIgnore, transformPath } from "../../../util/codeMapHelper"
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
        const isHide = matcher.isExcludedLeaf(leaf.path)
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

    // Per-rule engines reuse `returnIgnore` so the counts match how NodeDecorator actually
    // flattens/excludes nodes – including negated `!`-rules, which affect every path that
    // does *not* match. Positive rules are additionally merged into one combined engine
    // used as a prefilter: most paths match no rule at all, so they cost one engine test
    // instead of one per rule.
    const combinedPositive = ignore()
    const rules = itemsOfType.map(item => {
        const { ignoredNodePaths, condition } = returnIgnore(item.path)
        if (condition) {
            addRulePatternsToEngine(combinedPositive, item.path)
        }
        return { item, ignoredNodePaths, condition, affectedCount: 0 }
    })
    const positiveRules = rules.filter(rule => rule.condition)
    const negatedRules = rules.filter(rule => !rule.condition)

    for (const path of transformedLeafPaths) {
        if (positiveRules.length > 0 && combinedPositive.ignores(path)) {
            for (const rule of positiveRules) {
                if (rule.ignoredNodePaths.ignores(path)) {
                    rule.affectedCount++
                }
            }
        }
        for (const rule of negatedRules) {
            if (!rule.ignoredNodePaths.ignores(path)) {
                rule.affectedCount++
            }
        }
    }

    return rules
        .map(
            ({ item, affectedCount }): RuleWithCount => ({
                item,
                affectedCount,
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
