package de.maibornwolff.codecharta.analysers.analyserinterface.gitignore

import de.maibornwolff.codecharta.util.Logger
import java.io.File
import java.nio.file.FileSystems
import java.nio.file.Path
import java.nio.file.PathMatcher

class GitignorePatternMatcher(private val baseDir: File) {
    companion object {
        private const val GLOBSTAR = "/**/"
        private const val GLOBSTAR_PREFIX = "**/"
    }

    fun parseGitignoreFile(gitignoreFile: File): List<GitignoreRule> {
        if (!gitignoreFile.exists() || !gitignoreFile.isFile) {
            return emptyList()
        }

        return try {
            gitignoreFile.readLines().mapNotNull { parseGitignoreLine(it) }
        } catch (e: Exception) {
            Logger.error { "Error: Failed to parse ${gitignoreFile.path}: ${e.message}" }
            emptyList()
        }
    }

    fun shouldIgnore(file: File, rules: List<GitignoreRule>): Boolean {
        if (rules.isEmpty()) return false

        val relativePath = try {
            baseDir.toPath().relativize(file.toPath())
        } catch (_: Exception) {
            return false
        }

        return rules.lastOrNull { matchesRule(relativePath, file.isDirectory, it) }?.let { !it.isNegation } ?: false
    }

    private fun parseGitignoreLine(line: String): GitignoreRule? {
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
        val pathMatcher = createPathMatcher(globPattern, line) ?: return null
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

    private fun createPathMatcher(globPattern: String, originalLine: String): PathMatcher? {
        try {
            return FileSystems.getDefault().getPathMatcher("glob:$globPattern")
        } catch (e: Exception) {
            Logger.error { "Skipping invalid gitignore pattern '$originalLine': ${e.message}" }
            return null
        }
    }

    private fun createRootLevelMatcher(normalizedPattern: String, isRooted: Boolean, hasSlashInMiddle: Boolean): PathMatcher? {
        if (isRooted || hasSlashInMiddle) return null

        val rootPattern = prepareRootPattern(normalizedPattern)
        val escapedPattern = escapeGlobSpecialChars(rootPattern)
        return createPathMatcher(escapedPattern, normalizedPattern)
    }

    private fun createCollapsedGlobstarMatcher(normalizedPattern: String, isRooted: Boolean, hasSlashInMiddle: Boolean): PathMatcher? {
        if (!normalizedPattern.contains(GLOBSTAR)) return null

        val collapsedPattern = normalizedPattern.replace(GLOBSTAR, "/")
        val escapedPattern = escapeGlobSpecialChars(collapsedPattern)
        val globPattern = if (isRooted || hasSlashInMiddle) escapedPattern else "$GLOBSTAR_PREFIX$escapedPattern"
        return createPathMatcher(globPattern, normalizedPattern)
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

    private fun matchesRule(relativePath: Path, isDirectory: Boolean, rule: GitignoreRule): Boolean {
        if (rule.isDirOnly && !isDirectory) {
            return false
        }

        return rule.pathMatcher.matches(relativePath) ||
            rule.rootLevelMatcher?.matches(relativePath) == true ||
            rule.collapsedGlobstarMatcher?.matches(relativePath) == true
    }

    private fun escapeGlobSpecialChars(pattern: String): String {
        return pattern.replace("{", "\\{").replace("}", "\\}")
    }

    private fun removeUnquotedTrailingSpaces(pattern: String): String {
        var result = pattern
        while (result.endsWith(" ") && !result.endsWith("\\ ")) {
            result = result.dropLast(1)
        }
        return result
    }

    private fun isComment(pattern: String): Boolean {
        return pattern.startsWith("#") && !pattern.startsWith("\\#")
    }

    private fun isNegationPattern(pattern: String): Boolean {
        return pattern.startsWith("!") && !pattern.startsWith("\\!")
    }

    private fun unescapeSpecialCharacters(pattern: String): String {
        return pattern.replace("\\#", "#")
            .replace("\\!", "!")
            .replace("\\ ", " ")
    }
}
