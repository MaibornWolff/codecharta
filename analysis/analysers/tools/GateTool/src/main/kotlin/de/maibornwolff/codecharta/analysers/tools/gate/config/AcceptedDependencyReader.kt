package de.maibornwolff.codecharta.analysers.tools.gate.config

import de.maibornwolff.codecharta.analysers.tools.gate.config.YamlNodes.Companion.childPath
import org.yaml.snakeyaml.nodes.Node

class AcceptedDependencyReader(private val nodes: YamlNodes) {
    fun read(node: Node, path: String, rule: String): List<AcceptedDependency> {
        val items = nodes.items(node, path) ?: return emptyList()
        return items.mapIndexedNotNull { index, item -> readEntry(item, "$path[$index]", rule) }
    }

    private fun readEntry(item: Node, path: String, rule: String): AcceptedDependency? {
        val allowedKeys = if (rule == ConfigKeys.UPWARD) ConfigKeys.ACCEPTED_UPWARD else ConfigKeys.ACCEPTED_CYCLE
        val entries = nodes.entries(item, path, allowedKeys) ?: return null
        val files = filesOf(rule, entries, item, path)
        val reason = entries[ConfigKeys.REASON]?.let { nodes.text(it.value, childPath(path, ConfigKeys.REASON)) }
        if (reason == null) nodes.report(item, "$path needs a reason why the dependency is accepted")
        if (files == null || reason == null) return null
        return AcceptedDependency(files, reason)
    }

    private fun filesOf(rule: String, entries: Map<String, YamlEntry>, item: Node, path: String): List<String>? = when (rule) {
        ConfigKeys.UPWARD -> upwardFiles(entries, item, path)
        ConfigKeys.CYCLES_INSIDE_FILES -> cycleFiles(entries, item, path, FileCount(1..1, "exactly one file"))
        else -> cycleFiles(entries, item, path, FileCount(2..Int.MAX_VALUE, "at least two different files"))
    }

    private fun cycleFiles(entries: Map<String, YamlEntry>, item: Node, path: String, count: FileCount): List<String>? {
        val filesEntry = entries[ConfigKeys.FILES] ?: run {
            nodes.report(item, "$path needs files")
            return null
        }
        val filesPath = childPath(path, ConfigKeys.FILES)
        val files = exactPaths(filesEntry.value, filesPath)?.distinct() ?: return null
        if (files.size !in count.allowed) {
            nodes.report(filesEntry.value, "$filesPath must name ${count.description}")
            return null
        }
        return files
    }

    private fun upwardFiles(entries: Map<String, YamlEntry>, item: Node, path: String): List<String>? {
        val from = entries[ConfigKeys.FROM]
        val to = entries[ConfigKeys.TO]
        if (from == null || to == null) {
            nodes.report(item, "$path needs ${ConfigKeys.FROM} and ${ConfigKeys.TO}")
            return null
        }
        val fromFile = exactPath(from.value, childPath(path, ConfigKeys.FROM))
        val toFile = exactPath(to.value, childPath(path, ConfigKeys.TO))
        return if (fromFile == null || toFile == null) null else listOf(fromFile, toFile)
    }

    private fun exactPaths(node: Node, path: String): List<String>? {
        val items = nodes.items(node, path) ?: return null
        val files = items.mapIndexed { index, item -> exactPath(item, "$path[$index]") }
        return files.filterNotNull().takeIf { it.size == files.size }
    }

    private fun exactPath(node: Node, path: String): String? {
        val file = nodes.text(node, path) ?: return null
        if (isPattern(file)) {
            nodes.report(node, "$path must be the exact path of a file, found the pattern '$file'")
            return null
        }
        return file
    }

    private fun isPattern(file: String): Boolean =
        file.startsWith(NEGATION) || file.endsWith(FOLDER_END) || file.any { it in GLOB_CHARACTERS }

    private data class FileCount(val allowed: IntRange, val description: String)

    companion object {
        private const val NEGATION = "!"
        private const val FOLDER_END = "/"
        private const val GLOB_CHARACTERS = "*?["
    }
}
