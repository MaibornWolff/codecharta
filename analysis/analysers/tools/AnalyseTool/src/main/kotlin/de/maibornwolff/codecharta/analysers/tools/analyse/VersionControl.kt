package de.maibornwolff.codecharta.analysers.tools.analyse

import java.io.File

enum class VersionControl(val label: String, val checkout: String, private val marker: String, private val parserName: String) {
    GIT("git", "repository", ".git", "gitlogparser"),
    SVN("svn", "working copy", ".svn", "svnlogparser");

    fun isRootOf(folder: File): Boolean = File(folder, marker).exists()

    fun enclosingRootOf(folder: File, ceiling: File): File? {
        val ceilingFolder = ceiling.absoluteFile.normalize()
        return generateSequence(folder.absoluteFile.normalize().parentFile) { it.parentFile }
            .takeWhile { it != ceilingFolder }
            .firstOrNull(::isRootOf)
    }

    val sourceName: String get() = "$label history"

    fun skipped(reason: String): SkippedSource = SkippedSource(sourceName, reason)

    companion object {
        const val SVN_FOLDER_EXCLUDE_PATTERN = "(/|^)\\.svn(/|$)"

        fun sourceNameOf(name: String): String = entries.firstOrNull { it.parserName == name }?.label ?: name
    }
}
