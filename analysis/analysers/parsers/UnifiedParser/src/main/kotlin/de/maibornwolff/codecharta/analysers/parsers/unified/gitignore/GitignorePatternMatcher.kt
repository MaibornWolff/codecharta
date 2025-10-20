package de.maibornwolff.codecharta.analysers.parsers.unified.gitignore

import java.io.File
import java.nio.file.FileSystems
import java.nio.file.Path

/**
 * Converts gitignore patterns to glob patterns and checks if files match.
 *
 * Supports standard gitignore syntax:
 * - `*` matches anything except `/`
 * - `**` matches zero or more directories
 * - `?` matches single character except `/`
 * - `!` at start indicates negation pattern
 * - `/` at end indicates directory-only pattern
 * - `/` at start indicates rooted pattern (relative to gitignore location)
 */
class GitignorePatternMatcher(private val baseDir: File) {

    /**
     * Parses a .gitignore file and returns a list of GitignoreRule objects.
     *
     * @param gitignoreFile The .gitignore file to parse
     * @return List of parsed rules, in order
     */
    fun parseGitignoreFile(gitignoreFile: File): List<GitignoreRule> {
        if (!gitignoreFile.exists() || !gitignoreFile.isFile) {
            return emptyList()
        }

        return try {
            gitignoreFile.readLines()
                .mapNotNull { line -> parseGitignoreLine(line) }  // Don't trim! Need to handle trailing spaces
        } catch (e: Exception) {
            System.err.println("Warning: Failed to parse ${gitignoreFile.path}: ${e.message}")
            emptyList()
        }
    }

    /**
     * Parses a single line from a .gitignore file.
     *
     * @param line The line to parse (NOT trimmed - trailing spaces are significant)
     * @return GitignoreRule or null if line should be skipped
     */
    private fun parseGitignoreLine(line: String): GitignoreRule? {
        var pattern = line

        // Remove unquoted trailing spaces (Git spec: trailing spaces ignored unless quoted with backslash)
        while (pattern.endsWith(" ") && !pattern.endsWith("\\ ")) {
            pattern = pattern.dropLast(1)
        }

        // Skip empty lines
        if (pattern.isEmpty()) {
            return null
        }

        // Skip comments (unless escaped with backslash)
        if (pattern.startsWith("#") && !pattern.startsWith("\\#")) {
            return null
        }

        // Check for negation pattern BEFORE escaping (to avoid \! being treated as negation)
        val isNegation = pattern.startsWith("!") && !pattern.startsWith("\\!")
        if (isNegation) {
            pattern = pattern.substring(1)
        }

        // Handle backslash escaping: \# → #, \! → !, \<space> → <space>
        pattern = pattern.replace("\\#", "#")
            .replace("\\!", "!")
            .replace("\\ ", " ")

        // Check if directory-only pattern (ends with /)
        val isDirOnly = pattern.endsWith("/")
        if (isDirOnly) {
            pattern = pattern.dropLast(1)
        }

        // Check if rooted pattern (starts with /)
        val isRooted = pattern.startsWith("/")
        if (isRooted) {
            pattern = pattern.substring(1)
        }

        // Skip if pattern is empty after processing
        if (pattern.isEmpty()) {
            return null
        }

        // Check if pattern has slash in middle (makes it relative to gitignore location)
        // Exception: patterns starting with **/ should still match at any depth
        val hasSlashInMiddle = pattern.contains("/") && !pattern.startsWith("**/")

        // Convert to glob pattern and create PathMatcher
        val globPattern = convertToGlobPattern(pattern, isRooted, hasSlashInMiddle)
        val pathMatcher = try {
            FileSystems.getDefault().getPathMatcher("glob:$globPattern")
        } catch (e: Exception) {
            System.err.println("Warning: Invalid pattern '$line': ${e.message}")
            return null
        }

        // For non-rooted patterns (including **/foo), also create a matcher for root-level files
        val rootLevelMatcher = if (!isRooted && !hasSlashInMiddle) {
            try {
                // For patterns starting with **/, strip that prefix for root-level matching
                var rootPattern = if (pattern.startsWith("**/")) {
                    pattern.substring(3)
                } else {
                    pattern
                }
                // For patterns with /**/ in the middle (e.g., a/**/b), replace with / for root matching
                if (rootPattern.contains("/**/")) {
                    rootPattern = rootPattern.replace("/**/", "/")
                }
                val escapedPattern = rootPattern.replace("{", "\\{").replace("}", "\\}")
                FileSystems.getDefault().getPathMatcher("glob:$escapedPattern")
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }

        // For patterns with /**/ (e.g., a/**/b), create matcher for zero-directory case (e.g., a/b)
        // This handles the case where ** matches zero directories
        val zeroDirectoryMatcher = if (pattern.contains("/**/")) {
            try {
                val zeroPattern = pattern.replace("/**/", "/")
                val escapedPattern = zeroPattern.replace("{", "\\{").replace("}", "\\}")
                val globPattern = if (isRooted || hasSlashInMiddle) {
                    escapedPattern
                } else {
                    "**/$escapedPattern"
                }
                FileSystems.getDefault().getPathMatcher("glob:$globPattern")
            } catch (e: Exception) {
                null
            }
        } else {
            null
        }

        return GitignoreRule(
            pattern = line,
            isNegation = isNegation,
            isDirOnly = isDirOnly,
            isRooted = isRooted || hasSlashInMiddle,  // Both count as "rooted" for matching purposes
            pathMatcher = pathMatcher,
            rootLevelMatcher = rootLevelMatcher,
            zeroDirectoryMatcher = zeroDirectoryMatcher
        )
    }

    /**
     * Converts a gitignore pattern to a glob pattern.
     *
     * @param pattern The gitignore pattern (without prefix/suffix markers)
     * @param isRooted True if pattern starts with /
     * @param hasSlash True if pattern contains / in middle
     * @return Glob pattern string
     */
    private fun convertToGlobPattern(pattern: String, isRooted: Boolean, hasSlash: Boolean): String {
        var globPattern = pattern

        // Only escape curly braces - they have different meaning in glob
        // DON'T escape brackets [] - they mean the same thing in both gitignore and glob (character ranges)
        globPattern = globPattern.replace("{", "\\{").replace("}", "\\}")

        // Handle ** (matches zero or more directories) - already valid in glob syntax

        // Per Git spec:
        // - If pattern has / at beginning OR in middle: relative to .gitignore location
        // - If pattern has no /: matches at any depth
        globPattern = if (isRooted || hasSlash) {
            // Pattern is relative to .gitignore directory (don't add **)
            globPattern
        } else {
            // Pattern matches at any depth below .gitignore level
            // Don't add prefix if pattern already starts with **/
            if (globPattern.startsWith("**/")) {
                globPattern
            } else {
                "**/$globPattern"
            }
        }

        return globPattern
    }

    /**
     * Checks if a file matches the given gitignore rules.
     * Uses last-match-wins semantics.
     *
     * @param file The file to check
     * @param rules The list of gitignore rules to apply
     * @return True if file should be ignored, false otherwise
     */
    fun shouldIgnore(file: File, rules: List<GitignoreRule>): Boolean {
        if (rules.isEmpty()) {
            return false
        }

        // Get relative path from baseDir
        val relativePath = try {
            baseDir.toPath().relativize(file.toPath())
        } catch (e: Exception) {
            // If we can't relativize, don't ignore
            return false
        }

        // Apply rules in order, last match wins
        var isIgnored = false
        for (rule in rules) {
            if (matchesRule(relativePath, file.isDirectory, rule)) {
                isIgnored = !rule.isNegation
            }
        }

        return isIgnored
    }

    /**
     * Checks if a path matches a specific rule.
     *
     * @param relativePath The path relative to baseDir
     * @param isDirectory True if the path is a directory
     * @param rule The rule to check against
     * @return True if path matches the rule
     */
    private fun matchesRule(relativePath: Path, isDirectory: Boolean, rule: GitignoreRule): Boolean {
        // If rule is directory-only, skip non-directories
        if (rule.isDirOnly && !isDirectory) {
            return false
        }

        // Check if path matches the pattern (for nested paths)
        if (rule.pathMatcher.matches(relativePath)) {
            return true
        }

        // For non-rooted patterns, also check root-level matcher
        if (rule.rootLevelMatcher != null && rule.rootLevelMatcher.matches(relativePath)) {
            return true
        }

        // Check zero-directory matcher for patterns like a/**/b matching a/b
        if (rule.zeroDirectoryMatcher != null && rule.zeroDirectoryMatcher.matches(relativePath)) {
            return true
        }

        return false
    }
}
