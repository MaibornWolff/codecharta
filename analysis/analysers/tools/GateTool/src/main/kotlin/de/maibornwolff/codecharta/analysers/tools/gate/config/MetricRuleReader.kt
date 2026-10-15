package de.maibornwolff.codecharta.analysers.tools.gate.config

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignorePatternMatcher
import org.yaml.snakeyaml.nodes.Node
import java.io.File

class MetricRuleReader(private val nodes: YamlNodes) {
    private val patternParser = GitignorePatternMatcher(File("."))

    fun readMetrics(node: Node, path: String): Map<String, MetricRule> {
        val entries = nodes.entries(node, path) ?: return emptyMap()
        return entries.values
            .mapNotNull { entry -> readMetricRule(entry.value, "$path.${entry.key}")?.let { entry.key to it } }
            .toMap()
    }

    fun readOverrides(node: Node, path: String): List<PathOverride> {
        val items = nodes.items(node, path) ?: return emptyList()
        return items.mapIndexedNotNull { index, item -> readOverride(item, "$path[$index]") }
    }

    private fun readMetricRule(node: Node, path: String): MetricRule? {
        val levelNodes = readLevels(node, path)
        val levels =
            levelNodes
                .mapNotNull { (severity, levelNode) -> toLevelRule(levelNode, "$path.${severity.key}")?.let { severity to it } }
                .toMap()
        checkLevelOrder(levels, levelNodes, path)
        return if (levels.isEmpty()) null else MetricRule(levels)
    }

    private fun toLevelRule(levelNode: LevelNode, path: String): LevelRule? {
        val max = levelNode.level.max
        if (max == null) {
            if (!levelNode.hasInvalidMax) nodes.report(levelNode.maxNode ?: levelNode.keyNode, "$path.$MAX needs a number")
            return null
        }
        return LevelRule(max, levelNode.level.instruction)
    }

    private fun checkLevelOrder(levels: Map<Severity, LevelRule>, levelNodes: Map<Severity, LevelNode>, path: String) {
        val warningMax = levels[Severity.WARNING]?.max ?: return
        val errorMax = levels[Severity.ERROR]?.max ?: return
        if (warningMax <= errorMax) return
        val warningPath = "$path.${Severity.WARNING.key}.$MAX"
        val errorPath = "$path.${Severity.ERROR.key}.$MAX"
        nodes.report(
            levelNodes.getValue(Severity.WARNING).maxNode!!,
            "$warningPath (${warningMax.toDisplayText()}) must not be above $errorPath (${errorMax.toDisplayText()})"
        )
    }

    private fun readOverride(node: Node, path: String): PathOverride? {
        val entries = nodes.entries(node, path, OVERRIDE_KEYS) ?: return null
        val paths = entries[PATHS]?.let { readPatterns(it.value, "$path.$PATHS") } ?: emptyList()
        if (paths.isEmpty()) {
            nodes.report(entries[PATHS]?.keyNode ?: node, "$path.$PATHS needs at least one path pattern")
            return null
        }
        val metrics = entries[METRICS]?.let { readMetricOverrides(it.value, "$path.$METRICS") } ?: emptyMap()
        return PathOverride(paths, metrics)
    }

    private fun readPatterns(node: Node, path: String): List<String> {
        val items = nodes.items(node, path) ?: return emptyList()
        return items.mapIndexedNotNull { index, item ->
            val pattern = nodes.text(item, "$path[$index]") ?: return@mapIndexedNotNull null
            if (patternParser.parsePattern(pattern) == null) {
                nodes.report(item, "$path[$index] is not a valid path pattern: '$pattern'")
                return@mapIndexedNotNull null
            }
            pattern
        }
    }

    private fun readMetricOverrides(node: Node, path: String): Map<String, MetricOverride> {
        val entries = nodes.entries(node, path) ?: return emptyMap()
        return entries.values
            .mapNotNull { entry -> readMetricOverride(entry.value, "$path.${entry.key}")?.let { entry.key to it } }
            .toMap()
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

    private fun readLevels(node: Node, path: String): Map<Severity, LevelNode> {
        val entries = nodes.entries(node, path, Severity.entries.map { it.key }) ?: return emptyMap()
        return entries.values
            .mapNotNull { entry -> readLevel(entry, "$path.${entry.key}")?.let { Severity.ofKey(entry.key)!! to it } }
            .toMap()
    }

    private fun readLevel(entry: YamlEntry, path: String): LevelNode? {
        val entries = nodes.entries(entry.value, path, LEVEL_KEYS) ?: return null
        val maxNode = entries[MAX]?.value
        val max = maxNode?.let { nodes.number(it, "$path.$MAX") }
        val instruction = entries[INSTRUCTION]?.let { nodes.text(it.value, "$path.$INSTRUCTION") }
        val hasInvalidMax = maxNode != null && max == null && !nodes.isEmpty(maxNode)
        return LevelNode(entry.keyNode, maxNode, hasInvalidMax, LevelOverride(max, instruction))
    }

    private class LevelNode(val keyNode: Node, val maxNode: Node?, val hasInvalidMax: Boolean, val level: LevelOverride)

    companion object {
        private const val MAX = "max"
        private const val INSTRUCTION = "instruction"
        private const val PATHS = "paths"
        private const val METRICS = "metrics"
        private val LEVEL_KEYS = listOf(MAX, INSTRUCTION)
        private val OVERRIDE_KEYS = listOf(PATHS, METRICS)
    }
}
