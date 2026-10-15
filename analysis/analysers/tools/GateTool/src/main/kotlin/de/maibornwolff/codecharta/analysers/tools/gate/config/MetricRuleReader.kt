package de.maibornwolff.codecharta.analysers.tools.gate.config

import de.maibornwolff.codecharta.analysers.tools.gate.config.YamlNodes.Companion.bySeverity
import de.maibornwolff.codecharta.analysers.tools.gate.config.YamlNodes.Companion.childPath
import org.yaml.snakeyaml.nodes.Node

class MetricRuleReader(private val nodes: YamlNodes) {
    private val patternReader = PathPatternReader(nodes)

    fun readMetrics(node: Node, path: String): Map<String, MetricRule> = nodes.readMap(node, path) { entry, metricPath ->
        readMetricRule(entry.value, metricPath)
    }

    fun readOverrides(node: Node, path: String): List<PathOverride> {
        val items = nodes.items(node, path) ?: return emptyList()
        return items.mapIndexedNotNull { index, item -> readOverride(item, "$path[$index]") }
    }

    private fun readMetricRule(node: Node, path: String): MetricRule? {
        val levelNodes = readLevels(node, path)
        val levels = levelNodes
            .mapNotNull { (severity, levelNode) ->
                toLevelRule(levelNode, childPath(path, severity.key))?.let {
                    severity to
                        it
                }
            }.toMap()
        checkLevelOrder(levels, levelNodes, path)
        return if (levels.isEmpty()) null else MetricRule(levels)
    }

    private fun toLevelRule(levelNode: LevelNode, path: String): LevelRule? {
        val level = levelNode.level
        if (level.max != null || level.min != null) return LevelRule(level.max, level.instruction, level.min)
        val givenLimits = listOfNotNull(levelNode.minNode, levelNode.maxNode)
        if (givenLimits.none {
                !nodes.isEmpty(
                    it
                )
            }
        ) {
            nodes.report(givenLimits.firstOrNull() ?: levelNode.keyNode, "$path needs a max or a min")
        }
        return null
    }

    private fun checkLevelOrder(levels: Map<Severity, LevelRule>, levelNodes: Map<Severity, LevelNode>, path: String) {
        val warning = levels[Severity.WARNING] ?: return
        val error = levels[Severity.ERROR] ?: return
        val warningNode = levelNodes.getValue(Severity.WARNING)
        if (warning.max != null && error.max != null && warning.max > error.max) {
            reportOrder(warningNode.maxNode!!, path, ConfigKeys.MAX, "above", warning.max to error.max)
        }
        if (warning.min != null && error.min != null && warning.min < error.min) {
            reportOrder(warningNode.minNode!!, path, ConfigKeys.MIN, "below", warning.min to error.min)
        }
    }

    private fun reportOrder(
        node: Node,
        path: String,
        limitKey: String,
        direction: String,
        limits: Pair<Double, Double>
    ) {
        val warningPath = childPath(childPath(path, Severity.WARNING.key), limitKey)
        val errorPath = childPath(childPath(path, Severity.ERROR.key), limitKey)
        val (warningLimit, errorLimit) = limits
        nodes.report(
            node,
            "$warningPath (${warningLimit.toDisplayText()}) must not be $direction $errorPath (${errorLimit.toDisplayText()})"
        )
    }

    private fun readOverride(node: Node, path: String): PathOverride? {
        val entries = nodes.entries(node, path, ConfigKeys.OVERRIDE) ?: return null
        val pathsPath = childPath(path, ConfigKeys.PATHS)
        val paths = entries[ConfigKeys.PATHS]?.let { patternReader.read(it.value, pathsPath) } ?: emptyList()
        if (paths.isEmpty()) {
            nodes.report(entries[ConfigKeys.PATHS]?.keyNode ?: node, "$pathsPath needs at least one path pattern")
            return null
        }
        val metrics =
            entries[ConfigKeys.METRICS]?.let { metricsEntry ->
                nodes.readMap(
                    metricsEntry.value,
                    childPath(path, ConfigKeys.METRICS)
                ) { entry, metricPath -> readMetricOverride(entry.value, metricPath) }
            }
        return PathOverride(paths, metrics ?: emptyMap())
    }

    private fun readMetricOverride(node: Node, path: String): MetricOverride? {
        if (nodes.isScalar(node)) return readSwitchedOff(node, path)
        val levels = readLevels(node, path).mapValues { (_, levelNode) -> levelNode.level }
        return MetricOverride.Levels(levels)
    }

    private fun readSwitchedOff(node: Node, path: String): MetricOverride? {
        val value = nodes.text(node, path) ?: return null
        if (YamlNodes.isOff(value)) return MetricOverride.Off
        nodes.report(node, "$path must be off or a mapping of levels, found '$value'")
        return null
    }

    private fun readLevels(node: Node, path: String): Map<Severity, LevelNode> =
        nodes.readMap(node, path, Severity.entries.map { it.key }, ::readLevel).bySeverity()

    private fun readLevel(entry: YamlEntry, path: String): LevelNode? {
        val entries = nodes.entries(entry.value, path, ConfigKeys.LEVEL) ?: return null
        val minNode = entries[ConfigKeys.MIN]?.value
        val maxNode = entries[ConfigKeys.MAX]?.value
        val min = minNode?.let { nodes.number(it, childPath(path, ConfigKeys.MIN)) }
        val max = maxNode?.let { nodes.number(it, childPath(path, ConfigKeys.MAX)) }
        val instruction = entries[ConfigKeys.INSTRUCTION]?.let { nodes.text(it.value, childPath(path, ConfigKeys.INSTRUCTION)) }
        return LevelNode(entry.keyNode, minNode, maxNode, LevelOverride(max, instruction, min))
    }

    private class LevelNode(val keyNode: Node, val minNode: Node?, val maxNode: Node?, val level: LevelOverride)
}
