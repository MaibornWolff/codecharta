package de.maibornwolff.codecharta.analysers.parsers.unified.gitignore

import java.io.File
import java.util.concurrent.atomic.AtomicInteger

/**
 * Manages hierarchical .gitignore file processing for the UnifiedParser.
 *
 * Implements Git's gitignore semantics:
 * - Patterns are relative to the .gitignore file's directory
 * - Subdirectory .gitignore files inherit and override parent patterns
 * - Supports wildcards, negation, and directory-specific patterns
 * - Thread-safe for parallel file processing
 */
class GitignoreHandler(private val root: File) {
    // Cache of directory path -> (GitignorePatternMatcher, List<GitignoreRule>)
    private val gitignoreCache = mutableMapOf<String, Pair<GitignorePatternMatcher, List<GitignoreRule>>>()

    // Track discovered .gitignore files for statistics
    private val discoveredGitignoreFiles = mutableListOf<String>()

    // Thread-safe counter for excluded files
    private val excludedFileCount = AtomicInteger(0)

    /**
     * Discovers and parses all .gitignore files in the project tree.
     * Should be called once during initialization.
     */
    fun initialize() {
        root.walk().filter { it.isFile && it.name == ".gitignore" }.forEach { parseAndCacheGitignoreFile(it) }
    }

    /**
     * Parses a single .gitignore file and caches its patterns.
     *
     * @param gitignoreFile The .gitignore file to parse
     */
    private fun parseAndCacheGitignoreFile(gitignoreFile: File) {
        try {
            val directory = gitignoreFile.parentFile
            val matcher = GitignorePatternMatcher(directory)
            val rules = matcher.parseGitignoreFile(gitignoreFile)

            if (rules.isNotEmpty()) {
                gitignoreCache[directory.absolutePath] = Pair(matcher, rules)

                // Store relative path for statistics
                val relativePath = try {
                    root.toPath().relativize(gitignoreFile.toPath()).toString()
                } catch (e: Exception) {
                    gitignoreFile.absolutePath
                }
                discoveredGitignoreFiles.add(relativePath)
            }
        } catch (e: Exception) {
            System.err.println("Warning: Could not parse .gitignore at ${gitignoreFile.path}: ${e.message}")
        }
    }

    /**
     * Checks if a file should be excluded based on hierarchical gitignore rules.
     *
     * Applies rules from root to file's directory, with child rules overriding parent rules.
     *
     * @param file The file to check
     * @return True if the file should be excluded, false otherwise
     */
    fun shouldExclude(file: File): Boolean {
        if (gitignoreCache.isEmpty()) {
            return false
        }

        // Ensure file is within root
        if (!file.absolutePath.startsWith(root.absolutePath)) {
            return false
        }

        // Collect all applicable .gitignore files from root to file's directory
        val applicableRules = mutableListOf<Triple<File, GitignorePatternMatcher, List<GitignoreRule>>>()

        var currentDir = file.parentFile
        while (currentDir != null && currentDir.absolutePath.startsWith(root.absolutePath)) {
            gitignoreCache[currentDir.absolutePath]?.let { (matcher, rules) ->
                applicableRules.add(Triple(currentDir, matcher, rules))
            }
            currentDir = currentDir.parentFile
        }

        if (applicableRules.isEmpty()) {
            return false
        }

        // Apply rules from root to file's directory (reverse order)
        // This ensures child .gitignore files can override parent rules
        applicableRules.reverse()

        var isIgnored = false
        for ((directory, matcher, rules) in applicableRules) {
            // Check if file matches any rule in this directory's .gitignore
            if (matcher.shouldIgnore(file, rules)) {
                isIgnored = true
            } else {
                // If matcher explicitly says not to ignore (via negation), respect that
                // Check if there was a matching negation pattern
                val relPath = try {
                    directory.toPath().relativize(file.toPath())
                } catch (e: Exception) {
                    continue
                }

                for (rule in rules) {
                    // Check if this file matches a negation pattern
                    if (rule.isNegation && rule.pathMatcher.matches(relPath)) {
                        if (!rule.isDirOnly || file.isDirectory) {
                            isIgnored = false
                        }
                    } else if (!rule.isNegation && rule.pathMatcher.matches(relPath)) {
                        if (!rule.isDirOnly || file.isDirectory) {
                            isIgnored = true
                        }
                    }
                }
            }
        }

        if (isIgnored) {
            excludedFileCount.incrementAndGet()
        }

        return isIgnored
    }

    /**
     * Returns statistics about gitignore processing.
     *
     * @return Pair of (excluded file count, list of .gitignore file paths)
     */
    fun getStatistics(): Pair<Int, List<String>> {
        return Pair(excludedFileCount.get(), discoveredGitignoreFiles.toList())
    }

    /**
     * Returns the number of .gitignore files discovered.
     *
     * @return Count of .gitignore files
     */
    fun getGitignoreFileCount(): Int {
        return discoveredGitignoreFiles.size
    }

    /**
     * Returns the list of discovered .gitignore file paths.
     *
     * @return List of relative paths to .gitignore files
     */
    fun getGitignoreFiles(): List<String> {
        return discoveredGitignoreFiles.toList()
    }

    /**
     * Returns the number of files excluded by gitignore rules.
     *
     * @return Count of excluded files
     */
    fun getExcludedFileCount(): Int {
        return excludedFileCount.get()
    }
}
