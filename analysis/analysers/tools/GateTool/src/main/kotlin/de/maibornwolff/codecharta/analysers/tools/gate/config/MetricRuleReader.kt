package de.maibornwolff.codecharta.analysers.tools.gate.config

import de.maibornwolff.codecharta.analysers.tools.gate.config.YamlNodes.Companion.bySeverity
import de.maibornwolff.codecharta.analysers.tools.gate.config.YamlNodes.Companion.childPath
import org.yaml.snakeyaml.nodes.Node

class MetricRuleReader(private val nodes: YamlNodes) {
    private val patternReader = PathPatternReader(nodes)

    fun readMetrics(node: Node, path: String): Map<String, MetricRule> = nodes.readMap(node, path, read = ::readMetricRule)

    fun readOverrides(node: Node, path: String, metrics: Map<String, MetricRule>): List<PathOverride> {
        val items = nodes.items(node, path) ?: return emptyList()
        return items.mapIndexedNotNull { index, item -> readOverride(item, "$path[$index]", metrics) }
    }

    private fun readMetricRule(entry: YamlEntry, path: String): MetricRule? {
        val levelNodes = readLevels(entry.value, path)
        if (levelNodes.isEmpty()) {
            if (!nodes.hasProblemsWithin(entry.value)) nodes.report(entry.keyNode, "$path has no level; $LEVEL_HINT")
            return null
        }
        val levels = levelNodes.mapNotNull { (severity, levelNode) ->
            toLevelRule(levelNode, childPath(path, severity.key))?.let {
                severity to
                    it
            }
        }
        orderProblems(levels.toMap()).forEach { problem ->
            val limitNode = levelNodes.getValue(Severity.WARNING).limitNode(problem.limitKey)
            nodes.report(limitNode, problem.describeLevels(path))
        }
        return if (levels.isEmpty()) null else MetricRule(levels.toMap())
    }

    private fun toLevelRule(levelNode: LevelNode, path: String): LevelRule? {
        levelNode.level.applyTo(null)?.let { return it }
        val givenLimits = listOfNotNull(levelNode.minNode, levelNode.maxNode)
        val isLimitInvalid = givenLimits.any { !nodes.isEmpty(it) }
        if (!isLimitInvalid && !nodes.hasProblemsWithin(levelNode.valueNode)) {
            nodes.report(givenLimits.firstOrNull() ?: levelNode.keyNode, "$path needs a max or a min")
        }
        return null
    }

    private fun readOverride(node: Node, path: String, metrics: Map<String, MetricRule>): PathOverride? {
        val entries = nodes.entries(node, path, ConfigKeys.OVERRIDE) ?: return null
        val pathsPath = childPath(path, ConfigKeys.PATHS)
        val paths = entries[ConfigKeys.PATHS]?.let { patternReader.read(it.value, pathsPath) } ?: emptyList()
        if (paths.isEmpty()) {
            nodes.report(entries[ConfigKeys.PATHS]?.keyNode ?: node, "$pathsPath needs at least one path pattern")
            return null
        }
        val changes = entries[ConfigKeys.METRICS]?.let { readMetricOverrides(it.value, childPath(path, ConfigKeys.METRICS), metrics) }
        if (changes.isNullOrEmpty()) {
            if (!nodes.hasProblemsWithin(node)) nodes.report(node, "$path changes no metric; give it ${ConfigKeys.METRICS} or remove it")
            return null
        }
        return PathOverride(paths, changes)
    }

    private fun readMetricOverrides(node: Node, path: String, metrics: Map<String, MetricRule>): Map<String, MetricOverride> =
        nodes.readMap(node, path) { entry, metricPath -> readMetricOverride(entry, metricPath, metrics[entry.key]) }

    private fun readMetricOverride(entry: YamlEntry, path: String, globalRule: MetricRule?): MetricOverride? {
        if (nodes.isScalar(entry.value)) return readSwitchedOff(entry.value, path)
        val levelNodes = readLevels(entry.value, path)
        val change = MetricOverride.Levels(levelNodes.mapValues { (_, levelNode) -> levelNode.level })
        val merged = change.applyTo(globalRule?.levels.orEmpty())
        levelNodes
            .filter { (severity, levelNode) -> severity !in merged && !nodes.hasProblemsWithin(levelNode.valueNode) }
            .forEach { (severity, levelNode) ->
                val metricPath = childPath(ConfigKeys.METRICS, entry.key)
                nodes.report(
                    levelNode.keyNode,
                    "${childPath(path, severity.key)} sets no max or min, and $metricPath has none it could keep"
                )
            }
        orderProblems(merged).forEach { problem -> nodes.report(entry.keyNode, problem.describeOverride(path)) }
        return change
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
        return LevelNode(entry.keyNode, entry.value, minNode, maxNode, LevelOverride(max, instruction, min))
    }

    private fun orderProblems(levels: Map<Severity, LevelRule>): List<OrderProblem> {
        val warning = levels[Severity.WARNING] ?: return emptyList()
        val error = levels[Severity.ERROR] ?: return emptyList()
        val maxProblem =
            if (warning.max != null &&
                error.max != null &&
                warning.max > error.max
            ) {
                OrderProblem(ConfigKeys.MAX, "above", warning.max, error.max)
            } else {
                null
            }
        val minProblem =
            if (warning.min != null &&
                error.min != null &&
                warning.min < error.min
            ) {
                OrderProblem(ConfigKeys.MIN, "below", warning.min, error.min)
            } else {
                null
            }
        return listOfNotNull(maxProblem, minProblem)
    }

    private class LevelNode(
        val keyNode: Node,
        val valueNode: Node,
        val minNode: Node?,
        val maxNode: Node?,
        val level: LevelOverride
    ) {
        fun limitNode(limitKey: String): Node = (if (limitKey == ConfigKeys.MIN) minNode else maxNode) ?: valueNode
    }

    private class OrderProblem(val limitKey: String, val direction: String, val warningLimit: Double, val errorLimit: Double) {
        fun describeLevels(path: String): String {
            val warningPath = childPath(childPath(path, Severity.WARNING.key), limitKey)
            val errorPath = childPath(childPath(path, Severity.ERROR.key), limitKey)
            return "$warningPath (${warningLimit.toDisplayText()}) must not be $direction $errorPath (${errorLimit.toDisplayText()})"
        }

        fun describeOverride(path: String): String =
            "$path: ${Severity.WARNING.key} $limitKey (${warningLimit.toDisplayText()}) must not be $direction " +
                "${Severity.ERROR.key} $limitKey (${errorLimit.toDisplayText()}) for the files it matches"
    }

    companion object {
        private const val LEVEL_HINT = "give it a warning or error with a max or min, or remove it"
    }
}
