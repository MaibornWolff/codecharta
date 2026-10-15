package de.maibornwolff.codecharta.analysers.tools.gate.config

import org.yaml.snakeyaml.nodes.MappingNode
import org.yaml.snakeyaml.nodes.Node
import org.yaml.snakeyaml.nodes.ScalarNode
import org.yaml.snakeyaml.nodes.SequenceNode
import org.yaml.snakeyaml.nodes.Tag

data class ConfigProblem(val line: Int, val message: String) {
    override fun toString(): String = "line $line: $message"
}

data class YamlEntry(val key: String, val keyNode: Node, val value: Node)

class YamlNodes {
    private val collectedProblems = mutableListOf<ConfigProblem>()

    val problems: List<ConfigProblem> get() = collectedProblems

    fun report(node: Node, message: String) {
        collectedProblems.add(ConfigProblem(lineOf(node), message))
    }

    fun entries(node: Node, path: String, allowedKeys: Collection<String>? = null): Map<String, YamlEntry>? {
        if (isEmpty(node)) return emptyMap()
        if (node !is MappingNode) {
            report(node, "${path.ifEmpty { "the file" }} must be a mapping")
            return null
        }
        val entries = LinkedHashMap<String, YamlEntry>()
        node.value.forEach { tuple ->
            val key = (tuple.keyNode as? ScalarNode)?.value ?: return@forEach report(tuple.keyNode, "keys must be plain names")
            when {
                key in entries -> report(tuple.keyNode, "key '$key' is given twice")
                allowedKeys != null && key !in allowedKeys -> report(tuple.keyNode, unknownKeyMessage(key, path, allowedKeys))
                else -> entries[key] = YamlEntry(key, tuple.keyNode, tuple.valueNode)
            }
        }
        return entries
    }

    fun items(node: Node, path: String): List<Node>? {
        if (isEmpty(node)) return emptyList()
        if (node !is SequenceNode) {
            report(node, "$path must be a list")
            return null
        }
        return node.value
    }

    fun text(node: Node, path: String): String? {
        if (isEmpty(node)) return null
        if (node !is ScalarNode) {
            report(node, "$path must be a text")
            return null
        }
        return node.value
    }

    fun number(node: Node, path: String): Double? {
        val value = text(node, path) ?: return null
        return value.toDoubleOrNull() ?: run {
            report(node, "$path must be a number, found '$value'")
            null
        }
    }

    fun switch(node: Node, path: String): Boolean? {
        val value = text(node, path) ?: return null
        return SWITCH_VALUES[value.lowercase()] ?: run {
            report(node, "$path must be on or off, found '$value'")
            null
        }
    }

    fun severity(node: Node, path: String): Severity? {
        val value = text(node, path) ?: return null
        return Severity.ofKey(value) ?: run {
            report(node, "$path must be one of: ${Severity.entries.joinToString { it.key }}, found '$value'")
            null
        }
    }

    fun isEmpty(node: Node): Boolean = node is ScalarNode && node.tag == Tag.NULL

    fun isScalar(node: Node): Boolean = node is ScalarNode && !isEmpty(node)

    private fun unknownKeyMessage(key: String, path: String, allowedKeys: Collection<String>): String {
        val location = if (path.isEmpty()) "" else " in $path"
        return "unknown key '$key'$location, expected one of: ${allowedKeys.joinToString()}"
    }

    companion object {
        private val SWITCH_VALUES = mapOf("on" to true, "true" to true, "yes" to true, "off" to false, "false" to false, "no" to false)

        fun lineOf(node: Node): Int = node.startMark.line + 1

        fun isOff(value: String): Boolean = SWITCH_VALUES[value.lowercase()] == false
    }
}
