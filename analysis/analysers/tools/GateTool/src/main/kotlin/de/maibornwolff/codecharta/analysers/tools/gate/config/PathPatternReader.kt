package de.maibornwolff.codecharta.analysers.tools.gate.config

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignorePatternMatcher
import org.yaml.snakeyaml.nodes.Node
import java.io.File

class PathPatternReader(private val nodes: YamlNodes) {
    private val patternParser = GitignorePatternMatcher(File("."))

    fun read(node: Node, path: String): List<String> {
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
}
