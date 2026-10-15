package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignorePatternParser
import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignoreRule
import de.maibornwolff.codecharta.model.NodeId
import java.nio.file.Path

class PathPatterns(patterns: List<String>) {
    private val rules = patterns.mapNotNull { GitignorePatternParser.parse(it) }

    fun matches(path: String): Boolean = rules.lastOrNull { matchesFileOrAFolderAbove(it, path) }?.isNegation == false

    private fun matchesFileOrAFolderAbove(rule: GitignoreRule, path: String): Boolean {
        val segments = path.split(NodeId.SEPARATOR)
        return (1..segments.size).any { segmentCount ->
            val isFolder = segmentCount < segments.size
            rule.matches(Path.of(segments.take(segmentCount).joinToString(NodeId.SEPARATOR))) { isFolder }
        }
    }
}
