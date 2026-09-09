import { createSelector } from "@ngrx/store"
import ignore from "ignore"
import { RuleWithCount } from "../../../features/sidebarExplorer/facade"
import { BlacklistItem, BlacklistType, CodeMapNode } from "../../../model/codeCharta.model"
import { codeMapNodesSelector } from "../../../renderer/renderModel/renderModel.facade"
import { blacklistSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { addRulePatternsToEngine, returnIgnore, transformPath } from "../../../util/blacklist/blacklistMatcher"
import { isPatternRule } from "./isPattern"
import { excludeMetricRulesWithCountSelector, flattenMetricRulesWithCountSelector } from "./metricRulesWithCount.selector"

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
                id: `${item.type}/${item.path}`,
                label: item.path,
                item,
                affectedCount,
                kind: isPatternRule(item.path) ? "RULE" : "MANUAL"
            })
        )
        .sort((a, b) => a.label.localeCompare(b.label))
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

// Metric rules lead the list: they are the broadest strokes, and reading them first tells you why
// most of what is missing is missing.
export const flattenRulesWithCountSelector = createSelector(
    blacklistSelector,
    codeMapNodesSelector,
    flattenMetricRulesWithCountSelector,
    (blacklist, allLeaves, metricRules) => [...metricRules, ...buildRulesWithCount(blacklist, allLeaves, "flatten")]
)

export const excludeRulesWithCountSelector = createSelector(
    blacklistSelector,
    codeMapNodesSelector,
    excludeMetricRulesWithCountSelector,
    (blacklist, allLeaves, metricRules) => [...metricRules, ...buildRulesWithCount(blacklist, allLeaves, "exclude")]
)
