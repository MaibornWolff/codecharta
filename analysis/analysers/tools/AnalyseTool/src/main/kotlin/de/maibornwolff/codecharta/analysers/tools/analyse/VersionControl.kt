package de.maibornwolff.codecharta.analysers.tools.analyse

import java.io.File

enum class VersionControl(val label: String, val checkout: String, private val marker: String) {
    GIT("git", "repository", ".git"),
    SVN("svn", "working copy", ".svn");

    fun isRootOf(folder: File): Boolean = File(folder, marker).exists()

    fun enclosingRootOf(folder: File): File? =
        generateSequence(folder.absoluteFile.normalize().parentFile) { it.parentFile }.firstOrNull(::isRootOf)

    fun missingHistory(reason: String): String = "No $label history in the map: $reason"

    companion object {
        const val SVN_FOLDER_EXCLUDE_PATTERN = "(/|^)\\.svn(/|$)"
    }
}
