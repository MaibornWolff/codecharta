import { hierarchy } from "d3-hierarchy"
import { CodeMapNode, MetricRule, NodeMetricData } from "../../model/codeCharta.model"
import { BlacklistMatcher } from "../blacklist/blacklistMatcher"
import { isLeaf } from "../codeMapHelper"
import { createMetricRuleMatcher } from "../metricRule/metricRuleMatcher"
import { sortByMetricName } from "./sortByMetricName"
import { UNARY_METRIC } from "./unaryMetric"

type MetricStats = { values: number[]; minValue: number; maxValue: number }

/**
 * The range of every metric over the files the map shows. It reads the tree the map is built from,
 * because only there does a leaf carry the path a blacklist item addresses — the raw files of an
 * aggregated selection lack the file-name segment those paths contain.
 */
export const calculateNodeMetricData = (
    map: CodeMapNode | undefined,
    matcher: BlacklistMatcher,
    metricRules: MetricRule[] = []
): NodeMetricData[] => {
    if (!map) {
        return []
    }

    const includedLeaves = getIncludedLeaves(map, matcher)
    const metricNames = collectMetricNames(includedLeaves)
    const metricRuleMatcher = createMetricRuleMatcher(metricRules, metricNames)
    const leavesTheRulesKeep = includedLeaves.filter(leaf => !metricRuleMatcher.classify(leaf.attributes).isExcluded)
    const statsByMetric = collectStatsByMetric(leavesTheRulesKeep)

    // Every metric keeps its entry, even when a rule excludes all of its files: the NodeDecorator reads
    // the metrics on the map from these names, and a missing one would stop the rule from matching there.
    const metricData = [...metricNames].map(metricName => toNodeMetricData(metricName, statsByMetric.get(metricName)))
    sortByMetricName(metricData)
    return metricData
}

const getIncludedLeaves = (map: CodeMapNode, matcher: BlacklistMatcher): CodeMapNode[] =>
    hierarchy(map)
        .descendants()
        .map(({ data }) => data)
        .filter(node => isLeaf(node) && Boolean(node.path) && !matcher.isExcludedLeaf(node.path))

const collectMetricNames = (leaves: CodeMapNode[]): Set<string> => {
    const metricNames = new Set<string>([UNARY_METRIC])
    for (const leaf of leaves) {
        for (const metricName of Object.keys(leaf.attributes ?? {})) {
            metricNames.add(metricName)
        }
    }
    return metricNames
}

const collectStatsByMetric = (leaves: CodeMapNode[]): Map<string, MetricStats> => {
    const statsByMetric = new Map<string, MetricStats>()
    for (const leaf of leaves) {
        for (const [metricName, value] of Object.entries(leaf.attributes ?? {})) {
            const stats = statsByMetric.get(metricName)
            if (stats === undefined) {
                statsByMetric.set(metricName, { values: [value], minValue: value, maxValue: value })
                continue
            }
            stats.values.push(value)
            stats.minValue = Math.min(stats.minValue, value)
            stats.maxValue = Math.max(stats.maxValue, value)
        }
    }
    return statsByMetric
}

// Every file is exactly one unary, whatever the map contains.
const toNodeMetricData = (metricName: string, stats?: MetricStats): NodeMetricData => {
    if (metricName === UNARY_METRIC) {
        return { name: metricName, values: stats?.values ?? [], minValue: 1, maxValue: 1 }
    }
    return { name: metricName, values: stats?.values ?? [], minValue: stats?.minValue ?? 0, maxValue: stats?.maxValue ?? 0 }
}
