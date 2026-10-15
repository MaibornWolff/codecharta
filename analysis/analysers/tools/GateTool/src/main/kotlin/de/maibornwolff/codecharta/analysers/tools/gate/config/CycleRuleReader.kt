package de.maibornwolff.codecharta.analysers.tools.gate.config

import org.yaml.snakeyaml.nodes.Node

class CycleRuleReader(private val nodes: YamlNodes) {
    fun read(node: Node, path: String): CycleRules {
        val rules = nodes.readMap(node, path, ConfigKeys.CYCLE_RULES, ::readCycleRule)
        return CycleRules(
            betweenFiles = rules[ConfigKeys.BETWEEN_FILES],
            insideFiles = rules[ConfigKeys.INSIDE_FILES],
            upward = rules[ConfigKeys.UPWARD]
        )
    }

    private fun readCycleRule(entry: YamlEntry, path: String): CycleRule? {
        val entries = nodes.entries(entry.value, path, ConfigKeys.CYCLE_RULE) ?: return null
        val severityPath = YamlNodes.childPath(path, ConfigKeys.SEVERITY)
        val severityEntry = entries[ConfigKeys.SEVERITY]
        val instruction = entries[ConfigKeys.INSTRUCTION]?.let { nodes.text(it.value, YamlNodes.childPath(path, ConfigKeys.INSTRUCTION)) }
        val ignore = entries[ConfigKeys.IGNORE]?.let {
            PathPatternReader(
                nodes
            ).read(it.value, YamlNodes.childPath(path, ConfigKeys.IGNORE))
        }
        if (severityEntry == null || nodes.isEmpty(severityEntry.value)) {
            nodes.report(severityEntry?.value ?: entry.keyNode, "$severityPath needs one of: ${Severity.entries.joinToString { it.key }}")
            return null
        }
        val severity = nodes.severity(severityEntry.value, severityPath) ?: return null
        return CycleRule(severity, instruction, ignore ?: emptyList())
    }
}
