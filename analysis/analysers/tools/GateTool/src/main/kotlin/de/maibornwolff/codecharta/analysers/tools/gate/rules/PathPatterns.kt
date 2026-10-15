package de.maibornwolff.codecharta.analysers.tools.gate.rules

import de.maibornwolff.codecharta.analysers.analyserinterface.gitignore.GitignorePatternMatcher
import java.io.File
import java.nio.file.Path

class PathPatterns(patterns: List<String>) {
    private val rules = patterns.mapNotNull(GitignorePatternMatcher(File("."))::parsePattern)

    fun matches(path: String, isFolder: Boolean = false): Boolean {
        val segments = path.split(PATH_SEPARATOR)
        return (1..segments.size).any { segmentCount ->
            val isAncestor = segmentCount < segments.size
            val candidate = Path.of(segments.take(segmentCount).joinToString(PATH_SEPARATOR))
            rules.any { it.matches(candidate, isAncestor || isFolder) }
        }
    }

    companion object {
        private const val PATH_SEPARATOR = "/"
    }
}
