package de.maibornwolff.codecharta.analysers.analyserinterface.gitignore

import java.io.File
import java.nio.file.Path
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.atomic.AtomicInteger

// A folder's .gitignore is read the first time a path below it is checked, never by walking the tree up front: a
// walk prunes ignored folders, so the .gitignore files inside node_modules or build output are never read, as in git.
class GitignoreHandler(private val root: File) {
    private val rulesByDirectory = ConcurrentHashMap<String, List<GitignoreRule>>()
    private val consultedGitignoreFiles = ConcurrentLinkedQueue<String>()
    private val excludedFileCount = AtomicInteger(0)

    private fun rulesOf(directory: File): List<GitignoreRule> =
        rulesByDirectory.computeIfAbsent(directory.absolutePath) { readGitignoreRules(directory) }

    private fun readGitignoreRules(directory: File): List<GitignoreRule> {
        val gitignoreFile = File(directory, GITIGNORE_FILE_NAME)
        if (!gitignoreFile.isFile) return emptyList()
        return try {
            GitignorePatternMatcher(directory).parseGitignoreFile(gitignoreFile).also { rules ->
                if (rules.isNotEmpty()) consultedGitignoreFiles.add(getRelativePath(root, gitignoreFile).toString())
            }
        } catch (e: Exception) {
            System.err.println("Warning: Could not parse .gitignore at ${gitignoreFile.path}: ${e.message}")
            emptyList()
        }
    }

    fun shouldExclude(file: File): Boolean {
        if (!isFileWithinRoot(file)) {
            return false
        }

        // git always implicitly ignores the repository's own .git directory; the gitignore emulation must
        // too, otherwise the whole object store gets walked.
        if (isWithinGitDirectory(file)) {
            return true
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

    private fun collectAncestorGitignoreRules(file: File): List<Pair<File, List<GitignoreRule>>> {
        val applicableRules = mutableListOf<Pair<File, List<GitignoreRule>>>()

        var currentDir = file.parentFile
        while (currentDir != null && currentDir.absolutePath.startsWith(root.absolutePath)) {
            val rules = rulesOf(currentDir)
            if (rules.isNotEmpty()) applicableRules.add(Pair(currentDir, rules))
            currentDir = currentDir.parentFile
        }

        return applicableRules
    }

    private fun applyGitignoreRulesHierarchically(file: File, applicableRules: List<Pair<File, List<GitignoreRule>>>): Boolean {
        val rulesFromRootToFile = applicableRules.reversed()

        var isIgnored = false
        for ((directory, rules) in rulesFromRootToFile) {
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

    private fun ruleMatchesFile(rule: GitignoreRule, relPath: Path, file: File): Boolean = try {
        rule.matches(relPath, file::isDirectory)
    } catch (_: Exception) {
        false
    }

    fun getStatistics(): Pair<Int, List<String>> = Pair(excludedFileCount.get(), consultedGitignoreFiles.sorted())

    companion object {
        private const val GIT_DIRECTORY_NAME = ".git"
        private const val GITIGNORE_FILE_NAME = ".gitignore"
    }
}
