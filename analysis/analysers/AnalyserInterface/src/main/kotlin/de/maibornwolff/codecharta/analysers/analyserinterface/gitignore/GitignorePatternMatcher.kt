package de.maibornwolff.codecharta.analysers.analyserinterface.gitignore

import de.maibornwolff.codecharta.util.Logger
import java.io.File

class GitignorePatternMatcher(private val baseDir: File) {
    fun parseGitignoreFile(gitignoreFile: File): List<GitignoreRule> {
        if (!gitignoreFile.exists() || !gitignoreFile.isFile) {
            return emptyList()
        }

        return try {
            gitignoreFile.readLines().mapNotNull { line ->
                GitignorePatternParser.parse(line) { problem -> Logger.error { "Skipping invalid gitignore pattern '$line': $problem" } }
            }
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

        return rules.lastOrNull { it.matches(relativePath, file::isDirectory) }?.let { !it.isNegation } ?: false
    }
}
