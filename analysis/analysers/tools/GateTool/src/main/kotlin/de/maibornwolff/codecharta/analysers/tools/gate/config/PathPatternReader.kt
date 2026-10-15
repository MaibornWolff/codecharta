package de.maibornwolff.codecharta.analysers.tools.gate.config

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignorePatternParser
import org.yaml.snakeyaml.nodes.Node

class PathPatternReader(private val nodes: YamlNodes) {
    fun read(node: Node, path: String): List<String> {
        val items = nodes.items(node, path) ?: return emptyList()
        return items.mapIndexedNotNull { index, item ->
            val pattern = nodes.text(item, "$path[$index]") ?: return@mapIndexedNotNull null
            var invalidGlob: String? = null
            val rule = GitignorePatternParser.parse(pattern) { invalidGlob = it.lineSequence().first() }
            if (rule == null) {
                nodes.report(item, "$path[$index] is not a valid path pattern: '$pattern'${invalidGlob?.let { " ($it)" } ?: ""}")
                return@mapIndexedNotNull null
            }
            pattern
        }
    }
}
