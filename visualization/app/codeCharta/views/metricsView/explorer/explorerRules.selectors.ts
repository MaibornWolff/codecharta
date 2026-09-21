import { createSelector } from "@ngrx/store"
import ignore from "ignore"
import { RuleWithCount } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode, NodeRule, RuleEffect } from "../../../model/codeCharta.model"
import { codeMapNodesSelector } from "../../../renderer/renderModel/renderModel.facade"
import { excludedNodesSelector, flattenedNodesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import { addRulePatternsToEngine, returnIgnore, transformPath } from "../../../util/nodeRules/gitignorePattern"
import { isPatternRule } from "./isPattern"
import { excludeMetricRulesWithCountSelector, flattenMetricRulesWithCountSelector } from "./metricRulesWithCount.selector"

type RuleEvaluation = {
    item: NodeRule
    ignoredNodePaths: ReturnType<typeof ignore>
    condition: boolean
    affectedCount: number
}

const buildRulesWithCount = (nodeRules: NodeRule[], allLeaves: CodeMapNode[], effect: RuleEffect): RuleWithCount[] => {
    if (nodeRules.length === 0) {
        return []
    }

    const transformedLeafPaths = allLeaves.map(node => transformPath(node.path))
    const { rules, combinedPositivePrefilter } = buildRuleEnginesMatchingNodeDecorator(nodeRules)

    countAffectedLeaves(rules, combinedPositivePrefilter, transformedLeafPaths)

    return rules
        .map(
            ({ item, affectedCount }): RuleWithCount => ({
                id: `${effect}/${item.path}`,
                label: item.path,
                item,
                effect,
                affectedCount,
                kind: isPatternRule(item.path) ? "RULE" : "MANUAL"
            })
        )
        .sort((a, b) => a.label.localeCompare(b.label))
}

function buildRuleEnginesMatchingNodeDecorator(items: NodeRule[]) {
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
    flattenedNodesSelector,
    codeMapNodesSelector,
    flattenMetricRulesWithCountSelector,
    (flattenedNodes, allLeaves, metricRules) => [...metricRules, ...buildRulesWithCount(flattenedNodes, allLeaves, "flatten")]
)

export const excludeRulesWithCountSelector = createSelector(
    excludedNodesSelector,
    codeMapNodesSelector,
    excludeMetricRulesWithCountSelector,
    (excludedNodes, allLeaves, metricRules) => [...metricRules, ...buildRulesWithCount(excludedNodes, allLeaves, "exclude")]
)
