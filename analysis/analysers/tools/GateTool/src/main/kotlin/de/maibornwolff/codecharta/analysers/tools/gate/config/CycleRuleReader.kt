package de.maibornwolff.codecharta.analysers.tools.gate.config

import org.yaml.snakeyaml.nodes.Node

class CycleRuleReader(private val nodes: YamlNodes) {
    fun read(node: Node, path: String): CycleRules {
        val entries = nodes.entries(node, path, CYCLE_KEYS) ?: return CycleRules()
        return CycleRules(
            betweenFiles = entries[BETWEEN_FILES]?.let { readCycleRule(it, "$path.$BETWEEN_FILES") },
            insideFiles = entries[INSIDE_FILES]?.let { readCycleRule(it, "$path.$INSIDE_FILES") },
            upward = entries[UPWARD]?.let { readCycleRule(it, "$path.$UPWARD") }
        )
    }

    private fun readCycleRule(entry: YamlEntry, path: String): CycleRule? {
        val entries = nodes.entries(entry.value, path, RULE_KEYS) ?: return null
        val severityEntry = entries[SEVERITY]
        val instruction = entries[INSTRUCTION]?.let { nodes.text(it.value, "$path.$INSTRUCTION") }
        val ignore = entries[IGNORE]?.let { PathPatternReader(nodes).read(it.value, "$path.$IGNORE") } ?: emptyList()
        if (severityEntry == null || nodes.isEmpty(severityEntry.value)) {
            nodes.report(severityEntry?.value ?: entry.keyNode, "$path.$SEVERITY needs one of: ${Severity.entries.joinToString { it.key }}")
            return null
        }
        val severity = nodes.severity(severityEntry.value, "$path.$SEVERITY") ?: return null
        return CycleRule(severity, instruction, ignore)
    }

    companion object {
        private const val BETWEEN_FILES = "betweenFiles"
        private const val INSIDE_FILES = "insideFiles"
        private const val UPWARD = "upward"
        private const val IGNORE = "ignore"
        private const val SEVERITY = "severity"
        private const val INSTRUCTION = "instruction"
        private val CYCLE_KEYS = listOf(BETWEEN_FILES, INSIDE_FILES, UPWARD)
        private val RULE_KEYS = listOf(SEVERITY, INSTRUCTION, IGNORE)
    }
}
