package de.maibornwolff.codecharta.analysers.tools.gate.config

import org.yaml.snakeyaml.nodes.Node

class DependencyRuleReader(private val nodes: YamlNodes) {
    fun read(node: Node, path: String): DependencyRules {
        val rules = nodes.readMap(node, path, ConfigKeys.DEPENDENCY_RULES, ::readDependencyRule)
        return DependencyRules(
            cyclesBetweenFiles = rules[ConfigKeys.CYCLES_BETWEEN_FILES],
            cyclesInsideFiles = rules[ConfigKeys.CYCLES_INSIDE_FILES],
            upward = rules[ConfigKeys.UPWARD]
        )
    }

    private fun readDependencyRule(entry: YamlEntry, path: String): DependencyRule? {
        val entries = nodes.entries(entry.value, path, ConfigKeys.DEPENDENCY_RULE) ?: return null
        val severityPath = YamlNodes.childPath(path, ConfigKeys.SEVERITY)
        val severityEntry = entries[ConfigKeys.SEVERITY]
        val instruction = entries[ConfigKeys.INSTRUCTION]?.let { nodes.text(it.value, YamlNodes.childPath(path, ConfigKeys.INSTRUCTION)) }
        val ignore = entries[ConfigKeys.IGNORE]?.let {
            PathPatternReader(
                nodes
            ).read(it.value, YamlNodes.childPath(path, ConfigKeys.IGNORE))
        }
        val accept = entries[ConfigKeys.ACCEPT]?.let {
            AcceptedDependencyReader(nodes).read(it.value, YamlNodes.childPath(path, ConfigKeys.ACCEPT), entry.key)
        }
        if (severityEntry == null || nodes.isEmpty(severityEntry.value)) {
            nodes.report(severityEntry?.value ?: entry.keyNode, "$severityPath needs one of: ${Severity.entries.joinToString { it.key }}")
            return null
        }
        val severity = nodes.severity(severityEntry.value, severityPath) ?: return null
        return DependencyRule(severity, instruction, ignore ?: emptyList(), accept ?: emptyList())
    }
}
