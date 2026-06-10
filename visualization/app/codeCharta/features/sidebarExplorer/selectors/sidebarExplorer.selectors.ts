import { createSelector } from "@ngrx/store"
import ignore from "ignore"
import { BlacklistItem, BlacklistType, CodeMapNode } from "../../../codeCharta.model"
import { codeMapNodesSelector } from "../../../state/selectors/accumulatedData/codeMapNodes.selector"
import { searchedNodesSelector } from "../../../state/selectors/searchedNodes/searchedNodes.selector"
import { areaMetricSelector } from "../../../state/store/dynamicSettings/areaMetric/areaMetric.selector"
import { blacklistSelector } from "../../../state/store/fileSettings/blacklist/blacklist.selector"
import { addRulePatternsToEngine, isAreaValid, isLeaf, returnIgnore, transformPath } from "../../../util/codeMapHelper"
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

export const _calculateExplorerCounts = (searchedNodes: CodeMapNode[], allLeaves: CodeMapNode[], areaMetric: string): ExplorerCounts => {
    const matchingLeaves = searchedNodes.length > 0 ? searchedNodes.filter(node => isLeaf(node)) : allLeaves
    let flattened = 0
    let hidden = 0
    let shown = 0
    let noArea = 0
    for (const leaf of matchingLeaves) {
        if (leaf.isFlattened) {
            flattened++
        }
        if (leaf.isExcluded) {
            hidden++
        }
        if (!leaf.isFlattened && !leaf.isExcluded) {
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
    codeMapNodesSelector,
    areaMetricSelector,
    _calculateExplorerCounts
)

type RuleEvaluation = {
    item: BlacklistItem
    ignoredNodePaths: ReturnType<typeof ignore>
    condition: boolean
    affectedCount: number
}

const buildRulesWithCount = (blacklist: BlacklistItem[], allLeaves: CodeMapNode[], type: BlacklistType): RuleWithCount[] => {
    const itemsOfType = blacklist.filter(item => item.type === type)
    if (itemsOfType.length === 0) {
        return []
    }

    const transformedLeafPaths = allLeaves.map(node => transformPath(node.path))
    const { rules, combinedPositivePrefilter } = buildRuleEnginesMatchingNodeDecorator(itemsOfType)

    countAffectedLeaves(rules, combinedPositivePrefilter, transformedLeafPaths)

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

function buildRuleEnginesMatchingNodeDecorator(items: BlacklistItem[]) {
    const combinedPositivePrefilter = ignore()
    const rules = items.map((item): RuleEvaluation => {
        const { ignoredNodePaths, condition } = returnIgnore(item.path)
        if (condition) {
            addRulePatternsToEngine(combinedPositivePrefilter, item.path)
        }
        return { item, ignoredNodePaths, condition, affectedCount: 0 }
    })
    return { rules, combinedPositivePrefilter }
}

function countAffectedLeaves(
    rules: RuleEvaluation[],
    combinedPositivePrefilter: ReturnType<typeof ignore>,
    transformedLeafPaths: string[]
) {
    const positiveRules = rules.filter(rule => rule.condition)
    const negatedRules = rules.filter(rule => !rule.condition)

    for (const path of transformedLeafPaths) {
        if (positiveRules.length > 0 && combinedPositivePrefilter.ignores(path)) {
            incrementRulesMatching(positiveRules, path, true)
        }
        incrementRulesMatching(negatedRules, path, false)
    }
}

function incrementRulesMatching(rules: RuleEvaluation[], path: string, shouldMatch: boolean) {
    for (const rule of rules) {
        if (rule.ignoredNodePaths.ignores(path) === shouldMatch) {
            rule.affectedCount++
        }
    }
}

export const flattenRulesWithCountSelector = createSelector(blacklistSelector, codeMapNodesSelector, (blacklist, allLeaves) =>
    buildRulesWithCount(blacklist, allLeaves, "flatten")
)

export const excludeRulesWithCountSelector = createSelector(blacklistSelector, codeMapNodesSelector, (blacklist, allLeaves) =>
    buildRulesWithCount(blacklist, allLeaves, "exclude")
)
