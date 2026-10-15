package de.maibornwolff.codecharta.analysers.tools.gate.config

import org.yaml.snakeyaml.nodes.Node

class CycleRuleReader(private val nodes: YamlNodes) {
    fun read(node: Node, path: String): CycleRules {
        val entries = nodes.entries(node, path, CYCLE_KEYS) ?: return CycleRules()
        return CycleRules(
            file = entries[FILE]?.let { readCycleRule(it, "$path.$FILE") },
            packages = entries[PACKAGE]?.let { readCycleRule(it, "$path.$PACKAGE") },
            allowed = entries[ALLOW]?.let { readAllowed(it.value, "$path.$ALLOW") } ?: emptyList()
        )
    }

    private fun readCycleRule(entry: YamlEntry, path: String): CycleRule? {
        val entries = nodes.entries(entry.value, path, RULE_KEYS) ?: return null
        val severityEntry = entries[SEVERITY]
        val message = entries[MESSAGE]?.let { nodes.text(it.value, "$path.$MESSAGE") }
        if (severityEntry == null || nodes.isEmpty(severityEntry.value)) {
            nodes.report(severityEntry?.value ?: entry.keyNode, "$path.$SEVERITY needs one of: ${Severity.entries.joinToString { it.key }}")
            return null
        }
        val severity = nodes.severity(severityEntry.value, "$path.$SEVERITY") ?: return null
        return CycleRule(severity, message)
    }

    private fun readAllowed(node: Node, path: String): List<Set<String>> {
        val items = nodes.items(node, path) ?: return emptyList()
        return items.mapIndexedNotNull { index, item -> readAllowedCycle(item, "$path[$index]") }
    }

    private fun readAllowedCycle(node: Node, path: String): Set<String>? {
        val members = nodes.items(node, path)?.mapIndexedNotNull { index, item -> nodes.text(item, "$path[$index]") } ?: return null
        if (members.toSet().size < MINIMUM_CYCLE_SIZE) {
            nodes.report(node, "$path must list at least two paths")
            return null
        }
        return members.toSet()
    }

    companion object {
        private const val FILE = "file"
        private const val PACKAGE = "package"
        private const val ALLOW = "allow"
        private const val SEVERITY = "severity"
        private const val MESSAGE = "message"
        private const val MINIMUM_CYCLE_SIZE = 2
        private val CYCLE_KEYS = listOf(FILE, PACKAGE, ALLOW)
        private val RULE_KEYS = listOf(SEVERITY, MESSAGE)
    }
}
