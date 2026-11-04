package de.maibornwolff.codecharta.analysers.analyserinterface.gitignore

import java.io.File
import java.nio.file.Path
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.atomic.AtomicInteger

// A folder's .gitignore is read the first time a path below it is checked, never by walking the tree up front: a
// walk prunes ignored folders, so the .gitignore files inside node_modules or build output are never read, as in git.
class GitignoreHandler(private val root: File) {
    private val rootPath = root.absolutePath
    private val rulesByDirectory = ConcurrentHashMap<String, List<GitignoreRule>>()

    // Per folder, as every file of a folder asks the same about it: walking up from each file cost a scan of a large
    // project more than reading it
    private val ancestorRulesByDirectory = ConcurrentHashMap<String, List<Pair<File, List<GitignoreRule>>>>()
    private val isExcludedByDirectory = ConcurrentHashMap<String, Boolean>()
    private val isWithinGitDirectoryByDirectory = ConcurrentHashMap<String, Boolean>()
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

    private fun isFileWithinRoot(file: File): Boolean = file.absolutePath.startsWith(rootPath)

    // True when [file] is the scan root's .git directory or lives anywhere beneath it. The root itself
    // is never treated as a .git dir (a scan rooted at a .git dir is nonsensical, and pruning it would
    // just yield no files).
    private fun isWithinGitDirectory(file: File): Boolean {
        val path = file.absolutePath
        if (path == rootPath || !path.startsWith(rootPath)) return false
        if (file.name == GIT_DIRECTORY_NAME) return true
        val parent = file.parentFile ?: return false
        return memoized(isWithinGitDirectoryByDirectory, parent.absolutePath) { isWithinGitDirectory(parent) }
    }

    // The rules of the folders from the parent of [file] up to the root, nearest first
    private fun collectAncestorGitignoreRules(file: File): List<Pair<File, List<GitignoreRule>>> {
        val directory = file.parentFile ?: return emptyList()
        val path = directory.absolutePath
        if (!path.startsWith(rootPath)) return emptyList()
        return memoized(ancestorRulesByDirectory, path) {
            val rules = rulesOf(directory)
            val ancestorRules = collectAncestorGitignoreRules(directory)
            if (rules.isEmpty()) ancestorRules else listOf(Pair(directory, rules)) + ancestorRules
        }
    }

    // Not computeIfAbsent: the computation fills the same map for the folders above
    private fun <T : Any> memoized(cache: ConcurrentHashMap<String, T>, path: String, compute: () -> T): T =
        cache[path] ?: compute().also { cache.putIfAbsent(path, it) }

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

        return isExcludedByDirectory.computeIfAbsent(parentDir.absolutePath) {
            val applicableRules = collectAncestorGitignoreRules(parentDir)
            applicableRules.isNotEmpty() && applyGitignoreRulesHierarchically(parentDir, applicableRules)
        }
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
