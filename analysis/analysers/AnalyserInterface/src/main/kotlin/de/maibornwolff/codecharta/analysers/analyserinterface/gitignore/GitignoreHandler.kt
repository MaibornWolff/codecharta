package de.maibornwolff.codecharta.analysers.analyserinterface.gitignore

import java.io.File
import java.nio.file.Path
import java.util.concurrent.atomic.AtomicInteger

class GitignoreHandler(private val root: File) {
    private val gitignoreCache = mutableMapOf<String, Pair<GitignorePatternMatcher, List<GitignoreRule>>>()
    private val discoveredGitignoreFiles = mutableListOf<String>()
    private val excludedFileCount = AtomicInteger(0)

    init {
        // Never descend into a .git directory while discovering .gitignore files — it holds no rules
        // that should affect a scan and can be huge.
        root
            .walk()
            .onEnter { it.name != GIT_DIRECTORY_NAME }
            .filter { it.isFile && it.name == GITIGNORE_FILE_NAME }
            .forEach { parseAndCacheGitignoreFile(it) }
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
        if (!isFileWithinRoot(file)) {
            return false
        }

        // git always implicitly ignores the repository's own .git directory; the gitignore emulation must
        // too. Checked before the empty-cache short-circuit so it still holds for a repo whose root
        // .gitignore suppresses the build-folder fallback — otherwise the whole object store gets walked.
        if (isWithinGitDirectory(file)) {
            return true
        }

        if (gitignoreCache.isEmpty()) {
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

    private fun isFileWithinRoot(file: File): Boolean = file.absolutePath.startsWith(root.absolutePath)

    // True when [file] is the scan root's .git directory or lives anywhere beneath it. The root itself
    // is never treated as a .git dir (a scan rooted at a .git dir is nonsensical, and pruning it would
    // just yield no files).
    private fun isWithinGitDirectory(file: File): Boolean {
        var current: File? = file
        val rootPath = root.absolutePath
        while (current != null && current.absolutePath != rootPath && current.absolutePath.startsWith(rootPath)) {
            if (current.name == GIT_DIRECTORY_NAME) return true
            current = current.parentFile
        }
        return false
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

        if (!isIgnored && !file.isDirectory && file.parentFile != null) {
            isIgnored = isParentDirectoryExcluded(file.parentFile)
        }

        return isIgnored
    }

    private fun isParentDirectoryExcluded(parentDir: File): Boolean {
        if (!isFileWithinRoot(parentDir)) return false

        val applicableRules = collectAncestorGitignoreRules(parentDir)
        if (applicableRules.isEmpty()) return false

        return applyGitignoreRulesHierarchically(parentDir, applicableRules)
    }

    private fun getRelativePath(directory: File, file: File): Path = directory.toPath().relativize(file.toPath())

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

    fun getStatistics(): Pair<Int, List<String>> = Pair(excludedFileCount.get(), discoveredGitignoreFiles.toList())

    companion object {
        private const val GIT_DIRECTORY_NAME = ".git"
        private const val GITIGNORE_FILE_NAME = ".gitignore"
    }
}
