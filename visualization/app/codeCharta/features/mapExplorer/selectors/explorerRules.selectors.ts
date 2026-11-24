import { createSelector } from "@ngrx/store"
import ignore from "ignore"
import { CodeMapNode, NodeRule, RuleEffect } from "../../../model/codeCharta.model"
import { codeMapNodesSelector } from "../../../renderer/renderModel/renderModel.facade"
import { excludedNodesSelector, flattenedNodesSelector } from "../../../stores/sharedView/sharedView.read.facade"
import {
    createRuleMatcher,
    IgnoreEngine,
    isPlainInclusion,
    parseNodeRule,
    TransformedPathMatcher,
    toRuleLines,
    transformPath
} from "../../../util/nodeRules/gitignorePattern"
import { RuleWithCount } from "../../sidebarExplorer/facade"
import { isPatternRule } from "./isPattern"
import { excludeMetricRulesWithCountSelector, flattenMetricRulesWithCountSelector } from "./metricRulesWithCount.selector"

type RuleEvaluation = {
    item: NodeRule
    matches: TransformedPathMatcher
    isPlainInclusion: boolean
    affectedCount: number
}

const buildRulesWithCount = (nodeRules: NodeRule[], allLeaves: CodeMapNode[], effect: RuleEffect): RuleWithCount[] => {
    if (nodeRules.length === 0) {
        return []
    }

    const transformedLeafPaths = allLeaves.map(node => transformPath(node.path))
    const { rules, plainInclusionPrefilter } = buildRuleEvaluations(nodeRules)

    countAffectedLeaves(rules, plainInclusionPrefilter, transformedLeafPaths)

    return rules
        .map(
            ({ item, affectedCount }): RuleWithCount => ({
                id: `${effect}/${item.path}`,
                label: item.path,
                lines: toRuleLines(item.path),
                item,
                effect,
                affectedCount,
                kind: isPatternRule(item.path) ? "RULE" : "MANUAL"
            })
        )
        .sort((a, b) => a.label.localeCompare(b.label))
}

function buildRuleEvaluations(items: NodeRule[]) {
    const plainInclusionPrefilter = ignore()
    const rules = items.map((item): RuleEvaluation => {
        const patterns = parseNodeRule(item.path)
        const isPlainInclusionRule = isPlainInclusion(patterns)
        if (isPlainInclusionRule) {
            plainInclusionPrefilter.add(patterns.includes)
        }
        return { item, matches: createRuleMatcher(patterns), isPlainInclusion: isPlainInclusionRule, affectedCount: 0 }
    })
    return { rules, plainInclusionPrefilter }
}

function countAffectedLeaves(rules: RuleEvaluation[], plainInclusionPrefilter: IgnoreEngine, transformedLeafPaths: string[]) {
    const plainInclusionRules = rules.filter(rule => rule.isPlainInclusion)
    const subtractingRules = rules.filter(rule => !rule.isPlainInclusion)

    for (const path of transformedLeafPaths) {
        if (plainInclusionRules.length > 0 && plainInclusionPrefilter.ignores(path)) {
            incrementRulesMatching(plainInclusionRules, path)
        }
        incrementRulesMatching(subtractingRules, path)
    }
}

function incrementRulesMatching(rules: RuleEvaluation[], path: string) {
    for (const rule of rules) {
        if (rule.matches(path)) {
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
