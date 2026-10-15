package de.maibornwolff.codecharta.analysers.analyserinterface.gitignore

import java.nio.file.FileSystems
import java.nio.file.PathMatcher

object GitignorePatternParser {
    private const val GLOBSTAR = "/**/"
    private const val GLOBSTAR_PREFIX = "**/"

    fun parse(line: String, onInvalidGlob: (String) -> Unit = {}): GitignoreRule? {
        var normalizedPattern = removeUnquotedTrailingSpaces(line)

        if (normalizedPattern.isEmpty() || isComment(normalizedPattern)) {
            return null
        }

        val isNegation = isNegationPattern(normalizedPattern)
        if (isNegation) {
            normalizedPattern = normalizedPattern.substring(1)
        }

        normalizedPattern = unescapeSpecialCharacters(normalizedPattern)

        val isDirOnly = normalizedPattern.endsWith("/")
        if (isDirOnly) {
            normalizedPattern = normalizedPattern.dropLast(1)
        }

        val isRooted = normalizedPattern.startsWith("/")
        if (isRooted) {
            normalizedPattern = normalizedPattern.substring(1)
        }

        if (normalizedPattern.isEmpty()) {
            return null
        }

        val hasSlashInMiddle = normalizedPattern.contains("/") && !normalizedPattern.startsWith(GLOBSTAR_PREFIX)

        val globPattern = convertToGlobPattern(normalizedPattern, isRooted, hasSlashInMiddle)
        val pathMatcher = createPathMatcher(globPattern, onInvalidGlob) ?: return null
        val rootLevelMatcher = createRootLevelMatcher(normalizedPattern, isRooted, hasSlashInMiddle)
        val collapsedGlobstarMatcher = createCollapsedGlobstarMatcher(normalizedPattern, isRooted, hasSlashInMiddle)

        return GitignoreRule(
            pattern = line,
            isNegation = isNegation,
            isDirOnly = isDirOnly,
            isRooted = isRooted || hasSlashInMiddle,
            pathMatcher = pathMatcher,
            rootLevelMatcher = rootLevelMatcher,
            collapsedGlobstarMatcher = collapsedGlobstarMatcher
        )
    }

    private fun createPathMatcher(globPattern: String, onInvalidGlob: (String) -> Unit): PathMatcher? = try {
        FileSystems.getDefault().getPathMatcher("glob:$globPattern")
    } catch (e: Exception) {
        onInvalidGlob(e.message ?: "invalid glob")
        null
    }

    private fun createRootLevelMatcher(normalizedPattern: String, isRooted: Boolean, hasSlashInMiddle: Boolean): PathMatcher? {
        if (isRooted || hasSlashInMiddle) return null

        val rootPattern = prepareRootPattern(normalizedPattern)
        val escapedPattern = escapeGlobSpecialChars(rootPattern)
        return createPathMatcher(escapedPattern) {}
    }

    private fun createCollapsedGlobstarMatcher(normalizedPattern: String, isRooted: Boolean, hasSlashInMiddle: Boolean): PathMatcher? {
        if (!normalizedPattern.contains(GLOBSTAR)) return null

        val collapsedPattern = normalizedPattern.replace(GLOBSTAR, "/")
        val escapedPattern = escapeGlobSpecialChars(collapsedPattern)
        val globPattern = if (isRooted || hasSlashInMiddle) escapedPattern else "$GLOBSTAR_PREFIX$escapedPattern"
        return createPathMatcher(globPattern) {}
    }

    private fun convertToGlobPattern(pattern: String, isRooted: Boolean, hasSlashInMiddle: Boolean): String {
        val escapedPattern = escapeGlobSpecialChars(pattern)

        return if (isRooted || hasSlashInMiddle || escapedPattern.startsWith(GLOBSTAR_PREFIX)) {
            escapedPattern
        } else {
            "$GLOBSTAR_PREFIX$escapedPattern"
        }
    }

    private fun prepareRootPattern(pattern: String): String {
        var result = if (pattern.startsWith(GLOBSTAR_PREFIX)) {
            pattern.substring(GLOBSTAR_PREFIX.length)
        } else {
            pattern
        }

        if (result.contains(GLOBSTAR)) {
            result = result.replace(GLOBSTAR, "/")
        }

        return result
    }

    private fun escapeGlobSpecialChars(pattern: String): String = pattern.replace("{", "\\{").replace("}", "\\}")

    private fun removeUnquotedTrailingSpaces(pattern: String): String {
        var result = pattern
        while (result.endsWith(" ") && !result.endsWith("\\ ")) {
            result = result.dropLast(1)
        }
        return result
    }

    private fun isComment(pattern: String): Boolean = pattern.startsWith("#") && !pattern.startsWith("\\#")

    private fun isNegationPattern(pattern: String): Boolean = pattern.startsWith("!") && !pattern.startsWith("\\!")

    private fun unescapeSpecialCharacters(pattern: String): String = pattern
        .replace("\\#", "#")
        .replace("\\!", "!")
        .replace("\\ ", " ")
}
