package de.maibornwolff.codecharta.analysers.parsers.unified.gitignore

import java.io.File
import java.nio.file.Path
import java.util.concurrent.atomic.AtomicInteger

class GitignoreHandler(private val root: File) {
    private val gitignoreCache = mutableMapOf<String, Pair<GitignorePatternMatcher, List<GitignoreRule>>>()
    private val discoveredGitignoreFiles = mutableListOf<String>()
    private val excludedFileCount = AtomicInteger(0)

    init {
        root.walk().filter { it.isFile && it.name == ".gitignore" }.forEach { parseAndCacheGitignoreFile(it) }
    }

    private fun parseAndCacheGitignoreFile(gitignoreFile: File) {
        try {
            val directory = gitignoreFile.parentFile
            val matcher = GitignorePatternMatcher(directory)
            val rules = matcher.parseGitignoreFile(gitignoreFile)

            if (rules.isNotEmpty()) {
                gitignoreCache[directory.absolutePath] = Pair(matcher, rules)

                val relativePath = getRelativePath(root, gitignoreFile).toString()
                discoveredGitignoreFiles.add(relativePath)
            }
        } catch (e: Exception) {
            System.err.println("Warning: Could not parse .gitignore at ${gitignoreFile.path}: ${e.message}")
        }
    }

    fun shouldExclude(file: File): Boolean {
        if (gitignoreCache.isEmpty() || !isFileWithinRoot(file)) {
            return false
        }

        val applicableRules = collectAncestorGitignoreRules(file)
        if (applicableRules.isEmpty()) {
            return false
        }

        val isIgnored = applyGitignoreRulesHierarchically(file, applicableRules)

        if (isIgnored) {
            excludedFileCount.incrementAndGet()
        }

        return isIgnored
    }

    private fun isFileWithinRoot(file: File): Boolean {
        return file.absolutePath.startsWith(root.absolutePath)
    }

    private fun collectAncestorGitignoreRules(file: File): List<Triple<File, GitignorePatternMatcher, List<GitignoreRule>>> {
        val applicableRules = mutableListOf<Triple<File, GitignorePatternMatcher, List<GitignoreRule>>>()

        var currentDir = file.parentFile
        while (currentDir != null && currentDir.absolutePath.startsWith(root.absolutePath)) {
            gitignoreCache[currentDir.absolutePath]?.let { (matcher, rules) ->
                applicableRules.add(Triple(currentDir, matcher, rules))
            }
            currentDir = currentDir.parentFile
        }

        return applicableRules
    }

    private fun applyGitignoreRulesHierarchically(
        file: File,
        applicableRules: List<Triple<File, GitignorePatternMatcher, List<GitignoreRule>>>
    ): Boolean {
        val rulesFromRootToFile = applicableRules.reversed()

        var isIgnored = false
        for ((directory, _, rules) in rulesFromRootToFile) {
            val relPath = getRelativePath(directory, file)

            for (rule in rules) {
                if (ruleMatchesFile(rule, relPath, file)) {
                    isIgnored = !rule.isNegation
                }
            }
        }

        return isIgnored
    }

    private fun getRelativePath(directory: File, file: File): Path {
        return directory.toPath().relativize(file.toPath())
    }

    private fun ruleMatchesFile(rule: GitignoreRule, relPath: Path, file: File): Boolean {
        val pathMatches = try {
            rule.pathMatcher.matches(relPath) ||
                rule.rootLevelMatcher?.matches(relPath) == true ||
                rule.collapsedGlobstarMatcher?.matches(relPath) == true
        } catch (_: Exception) {
            false
        }

        return pathMatches && (!rule.isDirOnly || file.isDirectory)
    }

    fun getStatistics(): Pair<Int, List<String>> {
        return Pair(excludedFileCount.get(), discoveredGitignoreFiles.toList())
    }
}
